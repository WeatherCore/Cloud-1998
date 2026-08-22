/* 屏幕保护：星空 + 磷光语录（2 分钟无操作触发，任意输入退出）
   主路径为 WebGL2 星空引擎（starfield-gl.ts），不可用时降级回
   原版 Canvas 2D 星空 + DVD 弹跳语录。终端输入 stars 可手动呼出。 */

import { QUOTES } from "./content";
import { createStarfield, type Starfield } from "./starfield-gl";
import { el, rand, reducedMotion, sleep } from "./util";

const IDLE_MS = 120000;
const COLORS = ["#ffffff", "#00ffff", "#ffff00", "#ff7f50", "#7fffd4"];

let running = false;
let idleTimer: number | undefined;

export function initSaver() {
  if (reducedMotion()) return;
  const reset = () => {
    clearTimeout(idleTimer);
    if (!running) idleTimer = window.setTimeout(() => startSaver(false), IDLE_MS);
  };
  ["pointermove", "pointerdown", "keydown"].forEach((ev) =>
    document.addEventListener(ev, reset, { passive: true })
  );
  reset();
}

/** 终端 stars 命令入口；manual 会话退出时附带消磁音效 */
export function startSaver(manual: boolean) {
  if (running || reducedMotion()) return false;
  running = true;
  clearTimeout(idleTimer);

  const saver = el("div");
  saver.id = "saver";
  saver.classList.add("show");
  const canvas = el("canvas");
  const quote = el("div", "saver-quote");
  saver.append(canvas, quote);
  document.body.appendChild(saver);

  let engine: Starfield | null = createStarfield(canvas);
  let stopFx: () => void;
  if (engine) {
    saver.classList.add("gl");
    stopFx = runPhosphorQuotes(quote);
  } else {
    engine = null;
    stopFx = runLegacy2D(canvas, quote);
  }

  const stop = () => {
    stopFx();
    engine?.dispose();
    crtWake(manual);
    saver.remove();
    document.removeEventListener("pointerdown", stop);
    document.removeEventListener("keydown", stop);
    running = false;
    resetIdle();
  };
  /* 延迟绑定，避免手动呼出的那次按键顺手把屏保关掉 */
  setTimeout(() => {
    document.addEventListener("pointerdown", stop);
    document.addEventListener("keydown", stop);
  }, 300);
}

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => startSaver(false), IDLE_MS);
}

/* ---------- 主路径语录：琥珀磷光 + 打字机，浮现→驻留→淡出 ---------- */

function runPhosphorQuotes(quote: HTMLElement): () => void {
  let alive = true;
  let prev = -1;
  const caret = el("span", "saver-caret", "█");

  (async () => {
    await sleep(2400); /* 让星空先登场 */
    while (alive) {
      let i = rand(QUOTES.length);
      if (i === prev) i = (i + 1) % QUOTES.length;
      prev = i;
      const text = QUOTES[i];
      quote.classList.remove("dim");
      for (let n = 1; n <= text.length; n++) {
        if (!alive) return;
        quote.textContent = text.slice(0, n);
        quote.appendChild(caret);
        await sleep(45 + rand(75));
      }
      await sleep(6500); /* 驻留 */
      if (!alive) return;
      quote.classList.add("dim");
      await sleep(1600); /* 淡出 */
      await sleep(900);
    }
  })();

  return () => {
    alive = false;
  };
}

/* ---------- 降级路径：原版 Canvas 2D 星空 + DVD 弹跳，原样保留 ---------- */

function runLegacy2D(canvas: HTMLCanvasElement, quote: HTMLElement): () => void {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = (innerWidth * dpr) | 0;
    canvas.height = (innerHeight * dpr) | 0;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const g = canvas.getContext("2d")!;
  resize();

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random(),
  }));

  let qx = Math.random() * (innerWidth * 0.6);
  let qy = Math.random() * (innerHeight * 0.6);
  let qvx = 1.6;
  let qvy = 1.1;
  let raf = 0;

  const frame = () => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, innerWidth, innerHeight);
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    for (const s of stars) {
      s.z -= 0.006;
      if (s.z <= 0.02) {
        s.x = Math.random() * 2 - 1;
        s.y = Math.random() * 2 - 1;
        s.z = 1;
      }
      const px = cx + (s.x / s.z) * cx;
      const py = cy + (s.y / s.z) * cy;
      if (px < 0 || px > innerWidth || py < 0 || py > innerHeight) continue;
      const size = Math.max(1, (1 - s.z) * 3.2);
      g.fillStyle = `rgba(255,255,255,${1 - s.z * 0.7})`;
      g.fillRect(px, py, size, size);
    }

    qx += qvx;
    qy += qvy;
    const qw = quote.offsetWidth;
    const qh = quote.offsetHeight;
    if (qx <= 0 || qx + qw >= innerWidth) {
      qvx *= -1;
      quote.style.color = COLORS[rand(COLORS.length)];
    }
    if (qy <= 0 || qy + qh >= innerHeight) {
      qvy *= -1;
      quote.style.color = COLORS[rand(COLORS.length)];
    }
    quote.style.transform = `translate(${qx}px, ${qy}px)`;
    quote.style.left = "0";
    quote.style.top = "0";

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
  };
}

/* ---------- 退场：CRT 通电闪（手动呼出的会话附赠消磁「啵」） ---------- */

let actx: AudioContext | null = null;

function degaussSound() {
  try {
    actx ??= new AudioContext();
    if (actx.state === "suspended") void actx.resume();
    const t0 = actx.currentTime;
    /* 低频磁力「咚」+ 高频电感「哔」 */
    const o1 = actx.createOscillator();
    const g1 = actx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(70, t0);
    o1.frequency.exponentialRampToValueAtTime(34, t0 + 0.3);
    g1.gain.setValueAtTime(0.16, t0);
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    o1.connect(g1).connect(actx.destination);
    o1.start(t0);
    o1.stop(t0 + 0.35);
    const o2 = actx.createOscillator();
    const g2 = actx.createGain();
    o2.type = "triangle";
    o2.frequency.setValueAtTime(1150, t0 + 0.04);
    o2.frequency.exponentialRampToValueAtTime(560, t0 + 0.18);
    g2.gain.setValueAtTime(0.045, t0 + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    o2.connect(g2).connect(actx.destination);
    o2.start(t0 + 0.04);
    o2.stop(t0 + 0.22);
  } catch {
    /* 无声世界也挺好 */
  }
}

function crtWake(manual: boolean) {
  if (manual) degaussSound();
  document.getElementById("crt-wake")?.remove();
  const flash = el("div");
  flash.id = "crt-wake";
  const line = el("div", "crt-line");
  flash.appendChild(line);
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
}
