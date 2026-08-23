/* 贪吃蛇：方向键/WASD 移动，触屏滑动，最高分本地保存 */

import type { AppCtx, AppDef } from "../core/types";
import { DIALOGS } from "../core/content";
import { stats } from "../core/stats";
import { el, store } from "../core/util";
import { wm } from "../core/wm";

const COLS = 22;
const ROWS = 22;
const CELL = 12;
const BEST_KEY = "wc98-snake-best";

function build(ctx: AppCtx) {
  const { body } = ctx;
  const wrap = el("div", "snake-wrap");
  const stage = el("div", "snake-stage");
  const canvas = el("canvas") as HTMLCanvasElement;
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  stage.appendChild(canvas);
  const help = el("div", "snake-help");
  help.textContent = "方向键 / WASD 移动，触屏滑动，空格暂停";
  wrap.append(stage, help);
  body.appendChild(wrap);

  const g = canvas.getContext("2d")!;
  let snake: { x: number; y: number }[] = [];
  let dir = { x: 1, y: 0 };
  let pending = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let best = Number(store.get(BEST_KEY) ?? 0);
  let timer: number | undefined;
  let started = false;
  let alive = true;
  let paused = false;

  const info = el("div", "snake-help");
  const updateInfo = () => {
    info.textContent = paused
      ? `已暂停 · 得分 ${score} · 最高 ${best}`
      : started || !alive
        ? `得分 ${score} · 最高 ${best}`
        : `按任意方向键开始 · 最高 ${best}`;
  };
  wrap.insertBefore(info, help);

  const placeFood = () => {
    do {
      food = {
        x: (Math.random() * COLS) | 0,
        y: (Math.random() * ROWS) | 0,
      };
    } while (snake.some((s) => s.x === food.x && s.y === food.y));
  };

  const reset = () => {
    snake = [
      { x: 8, y: 11 },
      { x: 7, y: 11 },
      { x: 6, y: 11 },
    ];
    dir = { x: 1, y: 0 };
    pending = { x: 1, y: 0 };
    score = 0;
    alive = true;
    started = false;
    paused = false;
    clearInterval(timer);
    placeFood();
    draw();
    updateInfo();
  };

  const gameOver = () => {
    alive = false;
    started = false;
    clearInterval(timer);
    /* 成就埋点：分数门槛 */
    if (score >= 10) stats.once("snake.score10");
    if (score >= 30) stats.once("snake.score30");
    const isRecord = score > best;
    if (isRecord) {
      best = score;
      store.set(BEST_KEY, String(best));
    }
    updateInfo();
    wm.msgBox("贪吃蛇", DIALOGS.snakeOver(score, best), isRecord ? "info" : "warn");
  };

  const step = () => {
    /* 窗口最小化时自动暂停，避免看不见就死 */
    if (ctx.win.el.style.display === "none" && !paused) {
      paused = true;
      clearInterval(timer);
      draw();
      updateInfo();
      return;
    }
    dir = pending;
    const head = {
      x: (snake[0].x + dir.x + COLS) % COLS,
      y: (snake[0].y + dir.y + ROWS) % ROWS,
    };
    const eating = head.x === food.x && head.y === food.y;
    /* 撞身体判死；不吃食物时尾巴本帧会移开，追到尾巴不算死 */
    const hit = snake.some(
      (s, i) =>
        (eating ? i < snake.length : i < snake.length - 1) &&
        s.x === head.x &&
        s.y === head.y
    );
    if (hit) {
      gameOver();
      return;
    }
    snake.unshift(head);
    if (eating) {
      score++;
      placeFood();
      const speed = Math.max(70, 160 - score * 7);
      clearInterval(timer);
      timer = setInterval(step, speed);
      updateInfo();
    } else {
      snake.pop();
    }
    draw();
  };

  function draw() {
    g.fillStyle = "#000";
    g.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    /* 食物：红苹果 + 绿叶子 */
    g.fillStyle = "#ff2222";
    g.fillRect(food.x * CELL + 2, food.y * CELL + 3, CELL - 4, CELL - 5);
    g.fillStyle = "#00c040";
    g.fillRect(food.x * CELL + CELL / 2 - 1, food.y * CELL + 1, 3, 3);
    /* 蛇 */
    snake.forEach((s, i) => {
      g.fillStyle = i === 0 ? "#c8ffc8" : "#00e650";
      g.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    if (paused) {
      g.fillStyle = "#ffff00";
      g.font = "bold 14px SimSun, sans-serif";
      g.textAlign = "center";
      g.fillText("已暂停", (COLS * CELL) / 2, (ROWS * CELL) / 2);
    }
  }

  const setDir = (x: number, y: number) => {
    if (!alive) return;
    if (!started) {
      started = true;
      updateInfo();
      timer = setInterval(step, 160);
    }
    /* 禁止 180 度掉头 */
    if (dir.x === -x && dir.y === -y) return;
    pending = { x, y };
  };

  const KEYS: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    KeyW: [0, -1],
    KeyS: [0, 1],
    KeyA: [-1, 0],
    KeyD: [1, 0],
  };

  const speedMs = () => Math.max(70, 160 - score * 7);
  const resume = () => {
    paused = false;
    clearInterval(timer);
    timer = setInterval(step, speedMs());
    draw();
    updateInfo();
  };

  const onKey = (e: KeyboardEvent) => {
    /* 只在贪吃蛇窗口聚焦时响应，不抢其他窗口的按键 */
    if (!ctx.win.el.classList.contains("focused")) return;
    const d = KEYS[e.code];
    if (d) {
      e.preventDefault();
      if (paused) resume();
      setDir(d[0], d[1]);
    } else if (e.code === "Space" && started && alive) {
      e.preventDefault();
      if (paused) {
        resume();
      } else {
        paused = true;
        clearInterval(timer);
        draw();
        updateInfo();
      }
    }
  };
  window.addEventListener("keydown", onKey);

  /* 触屏滑动 */
  let touch: { x: number; y: number } | null = null;
  canvas.addEventListener("pointerdown", (e) => {
    touch = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!touch) return;
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(Math.sign(dx), 0);
    else setDir(0, Math.sign(dy));
    touch = null;
  });
  canvas.addEventListener("pointerup", () => (touch = null));

  reset();

  return () => {
    clearInterval(timer);
    window.removeEventListener("keydown", onKey);
  };
}

export const snakeApp: AppDef = {
  id: "snake",
  title: "贪吃蛇",
  icon: "snake",
  width: 330,
  height: 420,
  flush: true,
  build,
};
