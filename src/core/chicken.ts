/* ============================================================
   云咕咕：桌面宠物鸡
   贴图：public/sprites/gugu.png（星露谷原版，16px 帧 × 3 倍渲染）。
   白鸡主块帧表（与官方 Modding 文档一致）：
     r1 朝下走 | r2 朝右走 | r3 朝上走 | r4 朝左走（各 4 帧）
     r5 待机小动作（2 帧）| r6 啄食（2 帧）| r7 蹲伏（单帧，睡觉/下蛋共用）
   图层策略：平时挂 #desktop（窗口之下）；被拎起或屏保激活时挂
   body（z 8600，星空之上）——换父节点换层，两种身份一只鸡。
   打破约定特区：无视 prefers-reduced-motion；所有动作 JS 驱动，
   不吃全局 CSS 的动画冻结。
   ============================================================ */

import { GUGU } from "./content";
import { showBalloon } from "./shell";
import { iconEl } from "../ui/pixel";
import { clamp, el, rand } from "./util";
import { wm } from "./wm";

const SHEET = `${import.meta.env.BASE_URL}sprites/gugu.png`;
const S = 3; /* 渲染倍率：48px 一帧 */
const CELL = 16 * S;
const TASKBAR_H = 30;
/* 地面线微调：整只鸡（连带蛋、谷粒）统一抬高多少像素。
   建议填 3 的倍数——一格像素画 = 3px，保持锐利对齐；0 = 紧贴任务栏 */
const GROUND_LIFT = 3;
const WALK = 55; /* px/s */
const RUN = 95;
const SLEEP_AFTER = 90_000; /* 90 秒无互动入睡 */
const EGG_HATCH_MS = 8000; /* 蛋落地到破壳的倒计时 */
const KICK_V = 1300; /* 松手速度超过它(px/s)判定为甩击 */
const MOOD_WINDOW = 120_000; /* 心情事件的有效期 */

const ROW_DOWN = 0;
const ROW_RIGHT = 1;
const ROW_LEFT = 3;
const ROW_IDLE = 4;
const ROW_PECK = 5;
const ROW_SIT = 6;

type State =
  | "enter"
  | "walk"
  | "idle"
  | "peck"
  | "eat"
  | "carried"
  | "fall"
  | "kick"
  | "dizzy"
  | "sleep"
  | "lay"
  | "leave"
  | "gone";

type MoodType = "kicked" | "laid" | "hatched" | "fed" | "woken";
/* 心情优先级：序号小者胜（同处有效期内） */
const MOOD_ORDER: MoodType[] = ["kicked", "laid", "hatched", "fed", "woken"];

interface Chick {
  el: HTMLDivElement;
  x: number;
  dir: number;
  mode: "follow" | "stand" | "peck" | "panic" | "sit";
  t: number; /* 当前模式计时 ms */
  spinT: number; /* 急转圈换向计时 */
}

interface Grain {
  x: number;
  y: number;
  el: HTMLElement;
  vy: number;
  settled: boolean;
}

interface Particle {
  el: HTMLElement;
  vx: number;
  vy: number;
  g: number;
  age: number;
  life: number;
  sway: number;
  bounce: number;
  floor: number;
}

let root: HTMLDivElement | null = null;
let fxLayer: HTMLDivElement | null = null;
let state: State = "gone";
let x = 0;
let y = 0;
let dir = 1; /* 1 朝右 -1 朝左 */
let vy = 0; /* 下落速度 */
let vx = 0; /* 踢飞横向速度 */
let animT = 0; /* 动画计时 */
let stateT = 0; /* 当前状态持续时长(ms) */
let stateDur = 0; /* 本状态计划时长 */
let lastInteract = 0;
let layDueAt = 0;
let nextCluckAt = 0;
let eggEl: HTMLDivElement | null = null;
let eggX = 0;
let eggBornAt = 0;
let eggHatchAt = 0; /* 0 无蛋 | Infinity 不孵（小鸡满员） | 时间戳 倒计时 */
let chicks: Chick[] = [];
let mood: { type: MoodType; at: number } | null = null;
let onTop = false;
let tickTimer = 0;
let rafId = 0;
let particles: Particle[] = [];
let grains: Grain[] = [];

/* ---------- 持久化 ---------- */

const LS_RELEASED = "gugu-released";
const LS_MUTED = "gugu-muted";
const LS_EGGS = "gugu-eggs";
const LS_CHICKS = "gugu-chicks";
const LS_MET = "gugu-met";
let muted = localStorage.getItem(LS_MUTED) === "1";
let eggCount = Number(localStorage.getItem(LS_EGGS) ?? 0) || 0;
let hatchedCount = Number(localStorage.getItem(LS_CHICKS) ?? 0) || 0;
let metAt = Number(localStorage.getItem(LS_MET) ?? 0);
if (!metAt) {
  metAt = Date.now();
  localStorage.setItem(LS_MET, String(metAt));
}

/* ---------- 音效：WebAudio 现场合成，零音频文件 ---------- */

let actx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    actx ??= new AudioContext();
    if (actx.state === "suspended") void actx.resume();
    return actx;
  } catch {
    return null;
  }
}

function tone(
  f0: number,
  f1: number,
  dur: number,
  gain: number,
  type: OscillatorType = "square",
  delay = 0
) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

const cluck = () => {
  tone(760, 510, 0.09, 0.05);
  if (Math.random() < 0.5) tone(700, 480, 0.08, 0.04, "square", 0.13);
};
const softCluck = () => tone(360, 290, 0.13, 0.022);
const popSnd = () => tone(520, 940, 0.07, 0.045, "triangle");
const angryCluck = () => {
  tone(620, 340, 0.13, 0.06);
  tone(560, 300, 0.13, 0.055, "square", 0.16);
};

/* ---------- 心情：单槽事件，优先级高者在有效期内不被覆盖 ---------- */

function setMood(type: MoodType) {
  if (
    mood &&
    performance.now() - mood.at < MOOD_WINDOW &&
    MOOD_ORDER.indexOf(mood.type) < MOOD_ORDER.indexOf(type)
  ) {
    return; /* 有效期内有更高优先级心情，保留 */
  }
  mood = { type, at: performance.now() };
}

function moodText(): string {
  if (mood && performance.now() - mood.at < MOOD_WINDOW) return GUGU.moods[mood.type];
  return chicks.length > 0 ? GUGU.moods.broody : GUGU.moods.idle;
}

/* ---------- 粒子层：爱心/尘土/谷粒/zzz，全部 rAF 驱动 ---------- */

function ensureFx() {
  if (!fxLayer) {
    fxLayer = el("div");
    fxLayer.id = "gugu-fx";
    document.body.appendChild(fxLayer);
  }
}

function addParticle(
  node: HTMLElement,
  x0: number,
  y0: number,
  opt: Partial<Particle>
) {
  ensureFx();
  node.style.left = `${x0}px`;
  node.style.top = `${y0}px`;
  fxLayer!.appendChild(node);
  particles.push({
    el: node,
    vx: 0,
    vy: 0,
    g: 0,
    age: 0,
    life: 900,
    sway: 0,
    bounce: 0,
    floor: Infinity,
    ...opt,
  });
  startRaf();
}

function stepParticles(dt: number) {
  particles = particles.filter((p) => {
    p.age += dt * 1000;
    if (p.age >= p.life) {
      p.el.remove();
      return false;
    }
    p.vy += p.g * dt;
    let nx = p.el.offsetLeft + p.vx * dt;
    const ny = p.el.offsetTop + p.vy * dt;
    let doneY = false;
    if (ny >= p.floor && p.vy > 0) {
      if (p.bounce > 0 && Math.abs(p.vy) > 50) p.vy = -p.vy * p.bounce;
      else {
        p.vy = 0;
        doneY = true;
      }
    }
    if (p.sway) nx += Math.sin(p.age / 160) * p.sway * dt;
    p.el.style.left = `${nx}px`;
    if (!doneY || p.el.offsetTop !== p.floor) {
      p.el.style.top = `${doneY ? p.floor : ny}px`;
    }
    p.el.style.opacity = String(1 - p.age / p.life);
    return true;
  });
}

function hearts(n = 3) {
  const hx = x + CELL / 2 - 6;
  const hy = y + 4;
  for (let i = 0; i < n; i++) {
    const w = el("div", "gugu-heart");
    w.appendChild(iconEl("heart", 11));
    addParticle(w, hx + rand(18) - 6, hy + rand(8), {
      vy: -34 - rand(14),
      sway: 26,
      life: 950 + rand(250),
    });
  }
}

function dust() {
  for (let i = 0; i < 4; i++) {
    const d = el("div", "gugu-dust");
    addParticle(d, x + 8 + rand(CELL - 16), y + CELL - 6, {
      vx: rand(50) - 25,
      vy: -18 - rand(14),
      g: 120,
      life: 380,
    });
  }
}

function burst(px: number, py: number) {
  const colors = ["#ffffff", "#ffe1ae", "#dfdfdf"];
  for (let i = 0; i < 7; i++) {
    const d = el("div", "gugu-bit");
    d.style.background = colors[rand(colors.length)];
    addParticle(d, px, py, {
      vx: rand(160) - 80,
      vy: -rand(120),
      g: 320,
      life: 480 + rand(180),
    });
  }
}

function crumb(px: number, py: number) {
  for (let i = 0; i < 2; i++) {
    const d = el("div", "gugu-bit");
    d.style.background = "#e8c56a";
    addParticle(d, px, py, {
      vx: rand(60) - 30,
      vy: -50 - rand(30),
      g: 500,
      life: 380,
    });
  }
}

function zzz() {
  const t = el("div", "gugu-zzz", "Z");
  addParticle(t, x + CELL - 8, y - 4, { vx: 8, vy: -15, life: 2300 });
}

function floatText(text: string, px: number, py: number) {
  const t = el("div", "gugu-plus", text);
  addParticle(t, px, py, { vy: -26, life: 800 });
}

/* 羽毛：奶油色小片，慢慢飘落 */
function feathers() {
  const colors = ["#ffe1ae", "#ffffff", "#dfdfdf"];
  for (let i = 0; i < 7; i++) {
    const d = el("div", "gugu-bit");
    d.style.background = colors[rand(colors.length)];
    d.style.width = "5px";
    d.style.height = "3px";
    addParticle(d, x + rand(CELL), y + rand(CELL / 2), {
      vx: rand(70) - 35,
      vy: -rand(60),
      g: 70,
      sway: 46,
      life: 1000 + rand(600),
    });
  }
}

/* 晕头小星星：头顶漂浮 */
function dizzyStars() {
  for (let i = 0; i < 3; i++) {
    const d = el("div", "gugu-bit");
    d.style.background = "#ffff00";
    addParticle(d, x + 8 + rand(CELL - 16), y - 8 + rand(6), {
      vx: rand(40) - 20,
      vy: -26,
      life: 700,
    });
  }
}

/* rAF 常开条件：有粒子 / 下落中 / 谷粒未落地 */
function rafNeeded() {
  return (
    particles.length > 0 ||
    state === "fall" ||
    state === "kick" ||
    grains.some((g) => !g.settled)
  );
}

function startRaf() {
  if (rafId) return;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (state === "fall") {
      vy = Math.min(vy + 1300 * dt, 300); /* 扑翅缓降 */
      y += vy * dt;
      if (y >= groundY()) {
        y = groundY();
        land();
      }
      applyPos();
    } else if (state === "kick") {
      /* 甩击：抛物线 + 四边反弹 */
      vy += 1500 * dt;
      x += vx * dt;
      y += vy * dt;
      if (x <= 0) {
        x = 0;
        vx = -vx * 0.6;
      }
      if (x >= innerWidth - CELL) {
        x = innerWidth - CELL;
        vx = -vx * 0.6;
      }
      if (y <= 0 && vy < 0) {
        y = 0;
        vy = -vy * 0.6;
      }
      if (y >= groundY() && vy > 0) {
        y = groundY();
        if (vy > 320) {
          vy = -vy * 0.55;
          dust();
        } else {
          dizzyLand();
        }
      }
      applyPos();
    }
    stepParticles(dt);
    stepGrains(dt);
    if (rafNeeded()) rafId = requestAnimationFrame(loop);
    else rafId = 0;
  };
  rafId = requestAnimationFrame(loop);
}

/* ---------- 谷粒 ---------- */

function scatterGrains(px: number, py: number) {
  const n = 6 + rand(4);
  const desk = document.getElementById("desktop") ?? document.body;
  for (let i = 0; i < n; i++) {
    const d = el("div", "gugu-grain");
    const gx = clamp(px + rand(70) - 35, 6, innerWidth - 10);
    d.style.left = `${gx}px`;
    d.style.top = `${py + rand(20)}px`;
    desk.appendChild(d);
    grains.push({ x: gx, y: py + rand(20), el: d, vy: 0, settled: false });
  }
  startRaf();
  interact();
  if (state === "walk" || state === "idle" || state === "enter") {
    state = "eat";
    stateT = 0;
  }
}

function stepGrains(dt: number) {
  const floor = innerHeight - TASKBAR_H - 5 - GROUND_LIFT;
  for (const g of grains) {
    if (g.settled) continue;
    g.vy += 1100 * dt;
    g.y += g.vy * dt;
    if (g.y >= floor) {
      g.y = floor;
      if (g.vy > 120) g.vy = -g.vy * 0.3;
      else {
        g.vy = 0;
        g.settled = true;
      }
    }
    g.el.style.top = `${g.y}px`;
  }
}

function nearestGrain(): Grain | null {
  let best: Grain | null = null;
  let bd = Infinity;
  const cx = x + CELL / 2;
  for (const g of grains) {
    const d = Math.abs(g.x - cx);
    if (d < bd) {
      bd = d;
      best = g;
    }
  }
  return best;
}

/* ---------- 图层与绘制 ---------- */

const groundY = () => innerHeight - TASKBAR_H - CELL - GROUND_LIFT;

function mount(top: boolean) {
  if (!root) return;
  /* isConnected 守卫：新 spawn 的元素还没进过 DOM，
     即使 top === onTop 也必须完成首次挂载（否则鸡成幽灵） */
  if (top === onTop && root.isConnected) return;
  if (top) {
    root.style.position = "fixed";
    root.style.zIndex = "8600";
    document.body.appendChild(root);
  } else {
    root.style.position = "absolute";
    root.style.zIndex = "";
    (document.getElementById("desktop") ?? document.body).appendChild(root);
  }
  onTop = top;
}

function applyPos() {
  if (!root) return;
  root.style.left = `${x}px`;
  root.style.top = `${y}px`;
}

function drawFrame(row: number, col: number) {
  if (!root) return;
  root.style.backgroundPosition = `${-col * CELL}px ${-row * CELL}px`;
}

const setDir = (d: number) => (dir = d);

/* ---------- 蛋 ---------- */

function spawnEgg() {
  if (eggEl) return;
  eggX = clamp(x + (dir > 0 ? -16 : CELL), 4, innerWidth - 22);
  eggEl = el("div", "gugu-egg");
  eggEl.title = GUGU.eggTitle;
  eggEl.appendChild(iconEl("egg", 15));
  eggEl.addEventListener("click", (e) => {
    e.stopPropagation();
    collectEgg();
  });
  (document.getElementById("desktop") ?? document.body).appendChild(eggEl);
  eggEl.style.left = `${eggX}px`;
  eggEl.style.top = `${innerHeight - TASKBAR_H - 14 - GROUND_LIFT}px`;
  eggEl.style.transform = "rotate(0deg)";
  /* 8 秒竞速：手快点归你，手慢了破壳；小鸡满员则安心收集 */
  eggBornAt = performance.now();
  eggHatchAt = chicks.length >= 2 ? Infinity : eggBornAt + EGG_HATCH_MS;
}

/** 破壳：碎壳粒子 + 小鸡出场 + 气泡播报 */
function hatchEgg() {
  if (!eggEl) return;
  eggEl.remove();
  eggEl = null;
  eggHatchAt = 0;
  burst(eggX + 6, groundY() + CELL - 10);
  popSnd();
  spawnChick(eggX);
  setMood("hatched");
  hatchedCount += 1;
  localStorage.setItem(LS_CHICKS, String(hatchedCount));
  showBalloon(hatchedCount === 1 ? GUGU.firstChick : GUGU.secondChick);
  scheduleNextEgg();
}

function scheduleNextEgg() {
  layDueAt = performance.now() + 240_000 + rand(240_000); /* 4-8 分钟 */
}

function collectEgg() {
  if (!eggEl) return;
  const r = eggEl.getBoundingClientRect();
  eggEl.remove();
  eggEl = null;
  eggHatchAt = 0;
  eggCount += 1;
  localStorage.setItem(LS_EGGS, String(eggCount));
  popSnd();
  burst(r.left, r.top);
  floatText("+1", r.left, r.top - 10);
  if (eggCount === 10) showBalloon(GUGU.egg10);
  else if (eggCount % 10 === 0) showBalloon(GUGU.eggMore(eggCount));
}

/* ---------- 小鸡：从蛋里破壳的跟屁虫（上限 2 只） ---------- */

const CHICK_COL = 4; /* 白鸡块内小鸡子图起始列（0 基第 4 列起 4 列） */

function chickFrame(c: Chick, row: number, col: number) {
  c.el.style.backgroundPosition = `${-(CHICK_COL + col) * CELL}px ${-row * CELL}px`;
}

function spawnChick(x0: number) {
  const cEl = el("div", "gugu-chick");
  cEl.setAttribute("role", "img");
  cEl.setAttribute("aria-label", "小鸡");
  cEl.style.backgroundImage = `url("${SHEET}")`;
  cEl.style.backgroundSize = `${512 * S}px ${112 * S}px`;
  const c: Chick = { el: cEl, x: x0, dir: 1, mode: "follow", t: 0, spinT: 0 };
  chicks.push(c);
  (document.getElementById("desktop") ?? document.body).appendChild(cEl);
  cEl.style.top = `${groundY()}px`;
  cEl.style.left = `${c.x}px`;
  chickFrame(c, ROW_RIGHT, 0);
  hearts(1);
}

/* 小鸡跟着妈妈换层：平时桌面层，屏保/拎起时一起上顶层 */
function mountChicks(top: boolean) {
  for (const c of chicks) {
    const isBody = c.el.parentElement === document.body;
    if (top === isBody) continue;
    if (top) {
      c.el.style.position = "fixed";
      c.el.style.zIndex = "8600";
      document.body.appendChild(c.el);
    } else {
      c.el.style.position = "absolute";
      c.el.style.zIndex = "";
      (document.getElementById("desktop") ?? document.body).appendChild(c.el);
    }
  }
}

function updateChicks(dtMs: number) {
  const dt = dtMs / 1000;
  const gy = groundY();
  chicks.forEach((c, i) => {
    c.t += dtMs;
    if (state === "carried" || state === "kick" || state === "fall") {
      /* 妈妈上天了：原地急转圈跺脚 */
      c.mode = "panic";
      c.spinT += dtMs;
      if (c.spinT > 160) {
        c.dir = -c.dir;
        c.spinT = 0;
      }
      chickFrame(c, c.dir > 0 ? ROW_RIGHT : ROW_LEFT, Math.floor(c.t / 80) % 4);
      c.el.style.top = `${gy - (c.t % 320 < 160 ? 4 : 0)}px`;
    } else if (state === "sleep") {
      /* 妈妈睡了：挨着趴下 */
      c.mode = "sit";
      chickFrame(c, ROW_SIT, 0);
      c.el.style.top = `${gy}px`;
    } else {
      /* 跟随点：妈妈身后排队，第二只更靠后 */
      const target = x - dir * (46 + i * 34);
      const dist = target - c.x;
      if (Math.abs(dist) > 10) {
        c.mode = "follow";
        c.dir = dist > 0 ? 1 : -1;
        c.x += c.dir * Math.min(140, Math.abs(dist) * 3) * dt;
        chickFrame(c, c.dir > 0 ? ROW_RIGHT : ROW_LEFT, Math.floor(c.t / 130) % 4);
      } else if (state === "idle" || state === "peck") {
        /* 妈妈停着：小鸡自己啄两下地 */
        if (c.mode !== "peck" && c.t > 1500) {
          c.mode = "peck";
          c.t = 0;
        }
        if (c.mode === "peck") {
          chickFrame(c, ROW_PECK, Math.floor(c.t / 280) % 2);
          if (c.t > 1400) {
            c.mode = "follow";
            c.t = 0;
          }
        } else {
          chickFrame(c, ROW_DOWN, 0);
        }
      } else {
        chickFrame(c, ROW_DOWN, 0);
      }
      c.el.style.top = `${gy}px`;
    }
    c.x = clamp(c.x, 4, innerWidth - CELL - 4);
    c.el.style.left = `${c.x}px`;
  });
}

/* ---------- 状态机 ---------- */

function interact() {
  lastInteract = performance.now();
  if (state === "sleep") {
    state = "idle";
    stateT = 0;
    stateDur = 600;
    cluck();
    setMood("woken");
  }
}

function land() {
  state = "idle";
  stateT = 0;
  stateDur = 500 + rand(600);
  dust();
  cluck();
  mount(false);
}

/* 被甩飞落地：晕 1 秒 + 羽毛 + 愤怒双咕咕 */
function dizzyLand() {
  state = "dizzy";
  stateT = 0;
  dust();
  feathers();
  angryCluck();
  setMood("kicked");
  mount(false);
}

function kickStart(vx0: number, vy0: number) {
  state = "kick";
  vx = clamp(vx0, -1500, 1500);
  vy = clamp(vy0, -1200, 800);
  if (Math.abs(vy) < 150) vy = -250; /* 平甩也带一点抛物弧线 */
  cluck();
  startRaf();
}

function toWalk() {
  state = "walk";
  stateT = 0;
  stateDur = 1800 + rand(3800);
  if (Math.random() < 0.5) setDir(-dir);
  if (x < 60) setDir(1);
  if (x > innerWidth - CELL - 60) setDir(-1);
}

function brain(now: number, dtMs: number) {
  const dt = dtMs / 1000;
  stateT += dtMs;
  animT += dtMs;

  /* 屏保激活时升到星空之上；拎着/被甩飞时在最上层；其余回桌面层 */
  mount(
    state === "carried" ||
      state === "kick" ||
      state === "fall" ||
      document.getElementById("saver") !== null
  );

  switch (state) {
    case "enter": {
      x += 75 * dt;
      drawFrame(ROW_RIGHT, Math.floor(animT / 130) % 4);
      if (x >= 120 + rand(140)) {
        state = "idle";
        stateT = 0;
        stateDur = 900 + rand(1200);
        cluck();
      }
      break;
    }
    case "walk": {
      x += dir * WALK * dt;
      if (x <= 6) setDir(1);
      if (x >= innerWidth - CELL - 6) setDir(-1);
      drawFrame(dir > 0 ? ROW_RIGHT : ROW_LEFT, Math.floor(animT / 150) % 4);
      if (now > nextCluckAt) {
        softCluck();
        nextCluckAt = now + 18_000 + rand(22_000);
      }
      if (stateT >= stateDur) {
        const r = Math.random();
        if (r < 0.55) {
          state = "idle";
          stateT = 0;
          stateDur = 1200 + rand(2400);
        } else if (r < 0.8) {
          state = "peck";
          stateT = 0;
          stateDur = 1600 + rand(1200);
        } else {
          stateDur = 1500 + rand(2500);
        }
      }
      break;
    }
    case "idle": {
      /* 站着面向屏幕（朝下行走首帧），偶尔抖两下羽毛 */
      const fluff = stateT % 3200 > 2600;
      if (fluff) drawFrame(ROW_IDLE, Math.floor(animT / 220) % 2);
      else drawFrame(ROW_DOWN, 0);
      if (stateT >= stateDur) {
        if (now - lastInteract > SLEEP_AFTER && grains.length === 0) {
          state = "sleep";
          stateT = 0;
        } else toWalk();
      }
      break;
    }
    case "peck": {
      drawFrame(ROW_PECK, Math.floor(stateT / 300) % 2);
      if (stateT >= stateDur) toWalk();
      break;
    }
    case "eat": {
      const g = nearestGrain();
      if (!g) {
        /* 吃完了：冒爱心，下一次下蛋提前 */
        hearts(2);
        cluck();
        setMood("fed");
        layDueAt = Math.min(layDueAt, performance.now() + 20_000);
        state = "idle";
        stateT = 0;
        stateDur = 900;
        break;
      }
      if (!g.settled) break; /* 谷粒还在半空，等它落地 */
      const cx = x + CELL / 2;
      if (Math.abs(g.x - cx) > 8) {
        setDir(g.x > cx ? 1 : -1);
        x += dir * RUN * dt;
        drawFrame(dir > 0 ? ROW_RIGHT : ROW_LEFT, Math.floor(animT / 120) % 4);
      } else {
        drawFrame(ROW_PECK, Math.floor(stateT / 260) % 2);
        if (stateT > 300 && stateT % 520 < 90) {
          /* 低头瞬间吃掉嘴边这粒 */
          grains = grains.filter((o) => o !== g);
          g.el.remove();
          crumb(g.x, g.y);
          stateT = 0;
        }
      }
      break;
    }
    case "carried": {
      drawFrame(ROW_IDLE, Math.floor(animT / 110) % 2);
      break;
    }
    case "fall": {
      drawFrame(ROW_IDLE, Math.floor(animT / 90) % 2);
      break;
    }
    case "kick": {
      drawFrame(ROW_IDLE, Math.floor(animT / 90) % 2);
      break;
    }
    case "dizzy": {
      /* 晕 1 秒：摇头晃脑 + 头顶小星星 */
      drawFrame(ROW_DOWN, Math.floor(animT / 160) % 2);
      if (stateT % 350 < 90) dizzyStars();
      if (stateT >= 1100) {
        state = "idle";
        stateT = 0;
        stateDur = 500 + rand(500);
      }
      break;
    }
    case "sleep": {
      drawFrame(ROW_SIT, 0);
      if (stateT % 2200 < 90) zzz();
      break;
    }
    case "lay": {
      drawFrame(ROW_SIT, 0);
      if (stateT >= 2000) {
        spawnEgg();
        cluck();
        hearts(1);
        setMood("laid");
        scheduleNextEgg();
        state = "idle";
        stateT = 0;
        stateDur = 800;
      }
      break;
    }
    case "leave": {
      x += dir * 120 * dt;
      drawFrame(dir > 0 ? ROW_RIGHT : ROW_LEFT, Math.floor(animT / 110) % 4);
      if (x < -CELL - 20 || x > innerWidth + 20) {
        root?.remove();
        root = null;
        onTop = false;
        state = "gone";
        layDueAt = 0;
        grains.forEach((g) => g.el.remove());
        grains = [];
        chicks.forEach((c) => c.el.remove());
        chicks = [];
        showBalloon(GUGU.releaseHint);
      }
      break;
    }
    case "gone":
      break;
  }

  /* 下蛋计时（被拎着/睡着/吃着/已有蛋时不蹲） */
  if (
    layDueAt &&
    now > layDueAt &&
    !eggEl &&
    grains.length === 0 &&
    (state === "walk" || state === "idle")
  ) {
    state = "lay";
    stateT = 0;
  }
}

/* ---------- 定时器 ---------- */

function startTick() {
  if (tickTimer) return;
  let last = performance.now();
  tickTimer = window.setInterval(() => {
    const now = performance.now();
    const dt = Math.min(now - last, 200);
    last = now;
    if (state === "gone") return;
    x = clamp(x, -CELL - 20, innerWidth + 20);
    y = Math.min(y, groundY());
    brain(now, dt);
    applyPos();
    /* 蛋倒计时：晃动暗示，归零破壳 */
    if (eggEl && eggHatchAt > 0 && eggHatchAt !== Infinity) {
      const left = eggHatchAt - now;
      if (left <= 0) hatchEgg();
      else {
        const period = left < 2500 ? 200 : 500;
        const amp = left < 2500 ? 12 : 6;
        const ph = Math.floor((now - eggBornAt) / period) % 2;
        eggEl.style.transform = `rotate(${ph ? amp : -amp * 0.6}deg)`;
      }
    }
    mountChicks(onTop);
    updateChicks(dt);
    if (rafNeeded()) startRaf();
  }, 80);
}

/* ---------- 交互 ---------- */

function bindEvents() {
  if (!root) return;
  const r = root;
  const press = { id: -1, x: 0, y: 0, t: 0, moved: false };
  /* 部分内嵌浏览器只派发鼠标事件不派发 pointer 事件：
     见过真的 pointerdown 之后，鼠标兜底通道永久退位，避免双触发 */
  let pointerLive = false;

  const begin = (cx: number, cy: number) => {
    press.id = 1;
    press.x = cx;
    press.y = cy;
    press.t = performance.now();
    press.moved = false;
    interact();
  };
  /* 甩击判定用：保留最近两次 move 的位置与时间 */
  let pv = { x: 0, y: 0, t: 0 };
  let lv = { x: 0, y: 0, t: 0 };

  const move = (cx: number, cy: number) => {
    if (!press.moved && Math.hypot(cx - press.x, cy - press.y) > 7) {
      press.moved = true;
      if (state !== "gone" && state !== "leave") {
        state = "carried";
        mount(true);
        cluck();
      }
    }
    if (press.moved && state === "carried") {
      x = clamp(cx - CELL / 2, -20, innerWidth - CELL / 2);
      y = clamp(cy - CELL * 0.9, 0, innerHeight - 40);
      applyPos(); /* 逐事件贴住光标，不等 80ms tick */
      pv = lv;
      lv = { x: cx, y: cy, t: performance.now() };
    }
  };
  const end = () => {
    press.id = -1;
    if (state === "carried") {
      /* 松手瞬间手速决定轻重：慢放 = 扑翅缓降，快甩 = 踢飞 */
      const dt = lv.t - pv.t;
      const vx0 = dt > 2 ? ((lv.x - pv.x) / dt) * 1000 : 0;
      const vy0 = dt > 2 ? ((lv.y - pv.y) / dt) * 1000 : 0;
      if (Math.hypot(vx0, vy0) > KICK_V) kickStart(vx0, vy0);
      else {
        state = "fall";
        vy = 0;
        startRaf();
      }
    } else if (!press.moved && performance.now() - press.t < 400) {
      /* 轻点：咕咕叫 + 冒爱心 */
      cluck();
      hearts(3);
    }
  };

  r.addEventListener("pointerdown", (e) => {
    pointerLive = true;
    /* 屏保运行时不拦截冒泡：让屏保自己听到这次点击并退出 */
    if (!document.getElementById("saver")) e.stopPropagation();
    begin(e.clientX, e.clientY);
    try {
      r.setPointerCapture(e.pointerId);
    } catch {
      /* 合成输入可能拿不到有效指针 ID，兜底通道会接手 */
    }
  });
  /* 拖拽跟踪挂 document 而不是鸡身上：carry 开始时元素要换父节点
     挂到 body（浮到窗口之上），Chrome 在 reparent 时会释放
     pointer capture，挂在元素级会跟丢快速移动的光标 */
  document.addEventListener("pointermove", (e) => {
    if (press.id === -1) return;
    move(e.clientX, e.clientY);
  });
  document.addEventListener("pointerup", () => {
    if (press.id !== -1) end();
  });
  document.addEventListener("pointercancel", () => {
    if (press.id !== -1) end();
  });

  /* 鼠标事件兜底通道 */
  r.addEventListener("mousedown", (e) => {
    if (pointerLive || e.button !== 0) return;
    if (!document.getElementById("saver")) e.stopPropagation();
    begin(e.clientX, e.clientY);
  });
  document.addEventListener("mousemove", (e) => {
    if (pointerLive || press.id === -1) return;
    move(e.clientX, e.clientY);
  });
  const mouseEnd = () => {
    if (pointerLive || press.id === -1) return;
    end();
  };
  r.addEventListener("mouseup", mouseEnd);
  document.addEventListener("mouseup", mouseEnd);

  r.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    interact();
    openMenu(e.clientX, e.clientY);
  });
}

/* 鸡自己的右键菜单：z 8700，屏保星空之上也用得了 */
function openMenu(px: number, py: number) {
  document.getElementById("gugu-menu")?.remove();
  const menu = el("div");
  menu.id = "gugu-menu";
  const canHatch = !!eggEl && chicks.length < 2;
  const items: {
    label: string;
    icon?: string;
    sep?: boolean;
    disabled?: boolean;
    action?: () => void;
  }[] = [
    { label: GUGU.feed, icon: "grain", action: () => scatterGrains(px, py) },
    { label: GUGU.props, icon: "info", action: showProps },
    { label: GUGU.hatch, icon: "egg", disabled: !canHatch, action: hatchEgg },
    {
      label: muted ? GUGU.unmute : GUGU.mute,
      action: () => {
        muted = !muted;
        localStorage.setItem(LS_MUTED, muted ? "1" : "0");
        if (!muted) cluck();
      },
    },
    { label: "", sep: true },
    { label: GUGU.bye, icon: "power", action: releaseGugu },
  ];
  for (const it of items) {
    if (it.sep) {
      menu.appendChild(el("div", "menu-sep"));
      continue;
    }
    const row = el("div", "menu-item");
    if (it.disabled) row.classList.add("disabled");
    if (it.icon) row.appendChild(iconEl(it.icon, 18));
    row.appendChild(el("span", "", it.label));
    if (!it.disabled) {
      row.addEventListener("click", () => {
        menu.remove();
        it.action?.();
      });
    }
    menu.appendChild(row);
  }
  document.body.appendChild(menu);
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  /* 开在鸡头上方，避免菜单压住鸡 */
  menu.style.left = `${clamp(px - w / 2, 2, innerWidth - w - 4)}px`;
  menu.style.top = `${clamp(py - h - 60, 2, innerHeight - h - 34)}px`;

  const close = (e: PointerEvent) => {
    if (e.target instanceof Node && menu.contains(e.target)) return;
    menu.remove();
    document.removeEventListener("pointerdown", close, true);
  };
  document.addEventListener("pointerdown", close, true);
  menu.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* ---------- 生命周期 ---------- */

function spawn() {
  if (root) return;
  ensureFx();
  root = el("div");
  root.id = "gugu";
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", GUGU.name);
  root.style.backgroundImage = `url("${SHEET}")`;
  root.style.backgroundSize = `${512 * S}px ${112 * S}px`;
  x = -CELL - 10;
  y = groundY();
  dir = 1;
  vy = 0;
  animT = 0;
  state = "enter";
  stateT = 0;
  onTop = false;
  lastInteract = performance.now();
  nextCluckAt = lastInteract + 20_000;
  layDueAt = lastInteract + 150_000 + rand(90_000); /* 第一颗蛋 2.5-4 分钟 */
  mount(false);
  bindEvents();
  applyPos();
  drawFrame(ROW_RIGHT, 0);
}

/** 属性面板：Win98「属性」对话框（字段文案见 content.ts GUGU） */
function showProps() {
  const days = Math.floor((Date.now() - metAt) / 86_400_000);
  const met = days < 1 ? GUGU.metToday : GUGU.metDays(days);
  wm.msgBox(
    `${GUGU.name} 属性`,
    `<b>${GUGU.name}</b>　${GUGU.breed}<br>蛋：${GUGU.eggStats(eggCount, hatchedCount)}<br>陪伴：${met}<br>心情：${moodText()}`,
    "info"
  );
}

/** 终端 `chicken info`：属性面板的纯文本镜像 */
export function guguInfoLines(): string[] {
  const days = Math.floor((Date.now() - metAt) / 86_400_000);
  return [
    `${GUGU.name} · ${GUGU.breed}`,
    `蛋：${GUGU.eggStats(eggCount, hatchedCount)}`,
    `陪伴：${days < 1 ? GUGU.metToday : GUGU.metDays(days)}`,
    `心情：${moodText()}`,
  ];
}

/** 放生：走向最近的屏幕边缘，离开后记住状态 */
export function releaseGugu() {
  if (!root || state === "gone") return;
  setDir(x < innerWidth / 2 ? -1 : 1);
  state = "leave";
  stateT = 0;
  localStorage.setItem(LS_RELEASED, "1");
}

/** 在鸡身边撒一把谷粒（喂食） */
export function feedGugu() {
  if (!root || state === "gone") return;
  interact();
  scatterGrains(x + CELL / 2, y + 10);
}

/** 终端命令入口：召回或回应 */
export function summonGugu(): string {
  if (state === "gone") {
    localStorage.removeItem(LS_RELEASED);
    spawn();
    startTick();
    return GUGU.termRecall;
  }
  interact(); /* 睡着的鸡听见广播也要醒 */
  cluck();
  hearts(3);
  return GUGU.termHere;
}

export function initGugu() {
  if (localStorage.getItem(LS_RELEASED) === "1") return;
  /* 桌面就绪后 1 秒，云咕咕从屏幕左缘走进来 */
  window.setTimeout(() => {
    spawn();
    startTick();
  }, 1000);
}

/* dev 专用调试手柄（本地 dev/preview 用，生产域名下不暴露） */
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  (window as unknown as Record<string, unknown>).__gugu = {
    state: () => state,
    pos: () => ({ x, y, dir }),
    chicks: () => chicks.length,
    layNow: () => (layDueAt = performance.now()),
    sleepNow: () => (lastInteract = 0),
    recall: () => summonGugu(),
  };
}
