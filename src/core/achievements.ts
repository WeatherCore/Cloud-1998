/* ============================================================
   成就引擎：规则判定 + Steam 式滑入通知 + WebAudio 叮咚
   ------------------------------------------------------------
   今后加成就只需三步（不用动本文件的其余部分）：
   1. content.ts 的 ACHIEVEMENTS 加一条定义
   2. 下面 RULES 加一行判定（读 stats 计数器）
   3. 对应程序里 stats.bump("key") / stats.once("egg.xxx") 埋点
   ============================================================ */

import { ACH, ACHIEVEMENTS } from "./content";
import { iconEl } from "../ui/pixel";
import { el, store as storage } from "./util";
import { sound } from "./sound";
import { stats } from "./stats";

const LS_KEY = "wc98-ach";
const SHOW_MS = 4200;

interface AchStore {
  unlocked: Record<string, number>;
}

function load(): AchStore {
  try {
    const s = JSON.parse(storage.get(LS_KEY) ?? "{}");
    if (s && typeof s.unlocked === "object") return { unlocked: s.unlocked };
  } catch {
    /* 损坏数据当不存在 */
  }
  return { unlocked: {} };
}

let store = load();

function save() {
  storage.set(LS_KEY, JSON.stringify(store));
}

/* ---------- 判定规则：成就 id -> 是否达成（只读 stats） ---------- */

const RULES: Record<string, () => boolean> = {
  /* 彩蛋猎人 */
  xyzzy: () => stats.get("egg.xyzzy") > 0,
  div0: () => stats.get("egg.div0") > 0,
  e5318008: () => stats.get("egg.5318008") > 0,
  equals10: () => stats.get("egg.equals10") > 0,
  search: () => stats.get("egg.search") > 0,
  news: () => stats.get("egg.news") > 0,
  p404: () => stats.get("egg.404") > 0,
  offline: () => stats.get("egg.offline") > 0,
  soundcard: () => stats.get("egg.soundcard") > 0,
  mail: () => stats.get("egg.mail") > 0,
  konami: () => stats.get("egg.konami") > 0,
  bsod: () => stats.get("egg.bsod") > 0,
  /* 游戏里程碑 */
  snake10: () => stats.get("snake.score10") > 0,
  snake30: () => stats.get("snake.score30") > 0,
  mineB: () => stats.get("mine.win.beginner") > 0,
  mineI: () => stats.get("mine.win.intermediate") > 0,
  mineE: () => stats.get("mine.win.expert") > 0,
  /* 咕咕亲密度 */
  egg1: () => stats.get("gugu.eggs") >= 1,
  egg10: () => stats.get("gugu.eggs") >= 10,
  hatch: () => stats.get("gugu.hatch") > 0,
  kick: () => stats.get("gugu.kick") > 0,
  /* 冲浪痕迹 & 生活情趣 */
  surf: () =>
    ["visit.nav", "visit.home", "visit.guestbook", "visit.search", "visit.news"].every(
      (k) => stats.get(k) > 0
    ),
  guestbook: () => stats.get("guestbook.posts") >= 1,
  wallpaper: () => stats.get("wallpaper.set") > 0,
  gravity: () => stats.get("paint.gravity") > 0,
};

/* ---------- 解锁（供成就页 / 未来扩展读取） ---------- */

type UnlockListener = (id: string) => void;
const listeners: UnlockListener[] = [];

function unlock(id: string, silent: boolean): boolean {
  if (store.unlocked[id]) return false;
  store.unlocked[id] = Date.now();
  save();
  listeners.forEach((fn) => fn(id));
  if (!silent) {
    const def = ACHIEVEMENTS.find((d) => d.id === id);
    if (def) queueToast(ACH.toastTitle, def.name, def.icon);
  }
  return true;
}

function evaluate(silent: boolean): number {
  let n = 0;
  ACHIEVEMENTS.forEach((d) => {
    if (RULES[d.id]?.() && unlock(d.id, silent)) n++;
  });
  return n;
}

export const achievements = {
  defs: ACHIEVEMENTS,

  isUnlocked: (id: string) => Boolean(store.unlocked[id]),

  unlockedAt: (id: string) => store.unlocked[id] ?? 0,

  count: () => ACHIEVEMENTS.filter((d) => store.unlocked[d.id]).length,

  /** 成就页实时刷新用：每次解锁（含静默补发）都会回调；返回退订函数 */
  onUnlock(fn: UnlockListener): () => void {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  },

  /** 调试用：清零全部解锁记录（调用方需同时 stats.reset() 清计数） */
  reset(): void {
    store.unlocked = {};
    save();
  },
};

/* ---------- Steam 式滑入通知（右下角，排队依次弹） ---------- */

const queue: Array<() => void> = [];
let showing = false;

function pump() {
  if (showing || !queue.length) return;
  const next = queue.shift();
  if (!next) return;
  showing = true;
  next();
}

function queueToast(title: string, body: string, icon: string) {
  queue.push(() => showToast(title, body, icon));
  pump();
}

function showToast(title: string, body: string, icon: string) {
  const toast = el("div", "ach-toast");
  const ic = el("div", "ach-toast-icon");
  ic.appendChild(iconEl(icon, 30));
  const txt = el("div", "ach-toast-text");
  txt.append(el("b", "", title), el("span", "", body));
  toast.append(ic, txt);
  document.body.appendChild(toast);
  ding();
  /* 两帧后再滑入，保证过渡动画生效 */
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("in")));
  setTimeout(() => {
    toast.classList.remove("in");
    setTimeout(() => {
      toast.remove();
      showing = false;
      pump();
    }, 380);
  }, SHOW_MS);
}

/* ---------- 叮咚：走统一音效模块（共享静音开关与 AudioContext） ---------- */

function ding() {
  /* A5 -> E6：上扬纯五度，「叮-咚」 */
  sound.tone(880, 0, 0.1, 0.11);
  sound.tone(1318.51, 0.11, 0.26, 0.11);
}

/* ---------- 启动：订阅计数变化 + 历史战绩补发 ---------- */

export function initAchievements() {
  stats.onChange(() => evaluate(false));
  /* 老玩家的 stats 早已记录在案：静默补发，再弹一条摘要 */
  const granted = evaluate(true);
  if (granted > 0) {
    setTimeout(() => queueToast(ACH.retroTitle, ACH.retro(granted), "floppy"), 3200);
  }
}
