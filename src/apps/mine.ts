/* 扫雷：三级固定难度，首点安全，弦奏，问号，XYZZY 秘籍 */

import type { AppCtx, AppDef } from "../core/types";
import { MINE, MINE_LEVELS } from "../core/content";
import { stats } from "../core/stats";
import { el, isMobile, store } from "../core/util";
import { wm } from "../core/wm";

const BEST_KEY = "wc98-mine-best-";
const CELL = 16;

/* 数字颜色：1992 年定下的祖制 */
const NUM_COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

const FLAG_SVG = `<svg viewBox="0 0 12 12" width="12" height="12" shape-rendering="crispEdges"><rect x="5" y="1" width="1" height="9" fill="#000"/><rect x="6" y="2" width="4" height="3" fill="#ff0000"/><rect x="3" y="10" width="6" height="1" fill="#000"/></svg>`;

const MINE_SVG = `<svg viewBox="0 0 12 12" width="12" height="12" shape-rendering="crispEdges"><rect x="5" y="0" width="2" height="12" fill="#000"/><rect x="0" y="5" width="12" height="2" fill="#000"/><rect x="1" y="1" width="2" height="2" fill="#000"/><rect x="9" y="1" width="2" height="2" fill="#000"/><rect x="1" y="9" width="2" height="2" fill="#000"/><rect x="9" y="9" width="2" height="2" fill="#000"/><rect x="3" y="3" width="6" height="6" fill="#000"/><rect x="4" y="4" width="2" height="2" fill="#fff"/></svg>`;

/* 笑脸四态：平时 / 按下 / 阵亡 / 通关 */
const FACES: Record<string, string> = {
  idle: `<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="#ffff00" stroke="#000"/><circle cx="8" cy="9" r="1.6" fill="#000"/><circle cx="16" cy="9" r="1.6" fill="#000"/><path d="M6 14 q6 6 12 0" fill="none" stroke="#000" stroke-width="1.6"/></svg>`,
  oh: `<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="#ffff00" stroke="#000"/><circle cx="8" cy="9" r="1.8" fill="#000"/><circle cx="16" cy="9" r="1.8" fill="#000"/><circle cx="12" cy="15.5" r="2.6" fill="none" stroke="#000" stroke-width="1.6"/></svg>`,
  dead: `<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="#ffff00" stroke="#000"/><path d="M6 7 l4 4 M10 7 l-4 4 M14 7 l4 4 M18 7 l-4 4" stroke="#000" stroke-width="1.5"/><path d="M7 18 q5 -5 10 0" fill="none" stroke="#000" stroke-width="1.6"/></svg>`,
  cool: `<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="#ffff00" stroke="#000"/><path d="M4 8 h16 l-2 3 h-4.5 v-1 h-3 v1 H6 z" fill="#000"/><path d="M7 16 q5 4 10 -1" fill="none" stroke="#000" stroke-width="1.6"/></svg>`,
};

interface Cell {
  mine: boolean;
  open: boolean;
  /* 0 未标记 1 旗子 2 问号 */
  mark: number;
}

/* 菜单栏是静态的，用模块级控制器把菜单动作接进当前窗口 */
let ctl: {
  newGame: () => void;
  setLevel: (i: number) => void;
  showBest: () => void;
} | null = null;

function build(ctx: AppCtx) {
  const { body } = ctx;
  const mobile = isMobile();

  const wrap = el("div", "mine-wrap");
  const panel = el("div", "mine-panel");
  const ledMines = el("span", "mine-led");
  const face = el("button", "mine-face");
  face.type = "button";
  face.setAttribute("aria-label", "重新开始");
  const ledTime = el("span", "mine-led");
  panel.append(ledMines, face, ledTime);

  const boardEl = el("div", "mine-board");
  const help = el("div", "mine-help", mobile ? MINE.helpMobile : MINE.helpDesktop);
  wrap.append(panel, boardEl, help);
  body.appendChild(wrap);

  /* XYZZY 秘籍激活后出现的神秘像素（原版在屏幕角落，我们在窗口角落） */
  const pixel = el("div", "mine-pixel");
  body.appendChild(pixel);
  let cheat = false;

  let levelIdx = 0;
  let cols = 9;
  let rows = 9;
  let mines = 10;
  let cells: Cell[] = [];
  let opened = 0;
  let flags = 0;
  let dead = false;
  let won = false;
  let timer: number | undefined;
  let seconds = 0;
  /* 首点布雷：第一下翻开之前雷区还不存在 */
  let cellsPlaced = false;

  const idx = (x: number, y: number) => y * cols + x;
  const inBoard = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;

  const around = (x: number, y: number) => {
    const list: number[] = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        if (inBoard(x + dx, y + dy)) list.push(idx(x + dx, y + dy));
      }
    return list;
  };

  const countOf = (i: number) => {
    const x = i % cols;
    const y = (i / cols) | 0;
    return around(x, y).filter((j) => cells[j].mine).length;
  };

  const led = (n: number) => {
    const s = String(Math.abs(n)).padStart(3, "0");
    return n < 0 ? `-${s.slice(1)}` : s;
  };

  const setFace = (k: keyof typeof FACES) => (face.innerHTML = FACES[k]);
  const updateLeds = () => {
    ledMines.textContent = led(mines - flags);
    ledTime.textContent = led(Math.min(seconds, 999));
  };

  const startTimer = () => {
    if (timer !== undefined || dead || won) return;
    timer = window.setInterval(() => {
      seconds = Math.min(seconds + 1, 999);
      updateLeds();
    }, 1000);
  };
  const stopTimer = () => {
    clearInterval(timer);
    timer = undefined;
  };

  /* 首次翻开后才布雷，保证第一下永远是安全的（连周围一圈都让开） */
  const placeMines = (safe: number) => {
    const sx = safe % cols;
    const sy = (safe / cols) | 0;
    const forbidden = new Set<number>([safe, ...around(sx, sy)]);
    if (cols * rows - forbidden.size < mines) forbidden.clear();
    const pool = cells.map((_, i) => i).filter((i) => !forbidden.has(i));
    for (let n = 0; n < mines; n++) {
      const pick = pool.splice((Math.random() * pool.length) | 0, 1)[0];
      cells[pick].mine = true;
    }
  };

  const newGame = () => {
    const lv = MINE_LEVELS[levelIdx];
    cols = lv.cols;
    rows = lv.rows;
    mines = lv.mines;
    cells = Array.from({ length: cols * rows }, () => ({ mine: false, open: false, mark: 0 }));
    opened = 0;
    flags = 0;
    dead = false;
    won = false;
    seconds = 0;
    cellsPlaced = false;
    stopTimer();
    setFace("idle");
    updateLeds();
    renderBoard();
    stats.bump("mine.play");
    resizeWindow();
  };

  const explode = (at: number) => {
    dead = true;
    stopTimer();
    setFace("dead");
    cells.forEach((c, i) => {
      if (c.mine && c.mark !== 1) openCell(i, true);
      if (!c.mine && c.mark === 1) cellEls[i].classList.add("wrong");
    });
    cellEls[at].classList.add("boom");
    stats.bump("mine.lose");
  };

  const checkWin = () => {
    if (opened !== cols * rows - mines) return;
    won = true;
    stopTimer();
    setFace("cool");
    cells.forEach((c, i) => {
      if (c.mine && c.mark !== 1) {
        c.mark = 1;
        flags++;
        paint(i);
      }
    });
    updateLeds();
    const lv = MINE_LEVELS[levelIdx];
    stats.bump("mine.win");
    stats.bump(`mine.win.${lv.key}`);
    const key = BEST_KEY + lv.key;
    const best = Number(store.get(key) ?? 0);
    if (!best || seconds < best) {
      store.set(key, String(seconds));
      wm.msgBox("扫雷", MINE.winRecord(lv.label, seconds), "info");
    } else {
      wm.msgBox("扫雷", MINE.win(lv.label, seconds), "info");
    }
  };

  const openCell = (i: number, force = false) => {
    const c = cells[i];
    if (!force && (c.open || c.mark === 1 || dead || won)) return;
    if (!c.open) {
      c.open = true;
      opened++;
    }
    paint(i);
    if (c.mine) {
      if (!dead) explode(i);
      else if (force) cellEls[i].innerHTML = MINE_SVG;
      return;
    }
    const n = countOf(i);
    if (n === 0) around(i % cols, (i / cols) | 0).forEach((j) => openCell(j));
    checkWin();
  };

  /* 弦奏：数字周围旗数对得上时，双击把其余邻格一次翻开 */
  const chord = (i: number) => {
    const c = cells[i];
    if (!c.open || dead || won) return;
    const n = countOf(i);
    if (!n) return;
    const ns = around(i % cols, (i / cols) | 0);
    const flagged = ns.filter((j) => cells[j].mark === 1).length;
    if (flagged !== n) return;
    ns.forEach((j) => {
      if (!cells[j].open && cells[j].mark !== 1) openCell(j);
    });
  };

  const cycleMark = (i: number) => {
    const c = cells[i];
    if (c.open || dead || won) return;
    c.mark = (c.mark + 1) % 3;
    flags = cells.filter((cc) => cc.mark === 1).length;
    updateLeds();
    paint(i);
  };

  /* ---------- 渲染 ---------- */

  let cellEls: HTMLElement[] = [];

  function paint(i: number) {
    const c = cells[i];
    const d = cellEls[i];
    if (!d) return;
    d.className = "mine-cell";
    d.innerHTML = "";
    if (c.open) {
      d.classList.add("open");
      if (c.mine) {
        d.innerHTML = MINE_SVG;
      } else {
        const n = countOf(i);
        if (n) {
          d.textContent = String(n);
          d.style.color = NUM_COLORS[n];
        }
      }
    } else if (c.mark === 1) {
      d.innerHTML = FLAG_SVG;
    } else if (c.mark === 2) {
      d.textContent = "?";
    }
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    /* 触屏 / 窄屏把格子缩到能放下为止（高级 30 列也要塞得进手机） */
    const avail = Math.min(innerWidth, 700) - 46;
    const size = mobile ? Math.max(14, Math.min(22, Math.floor(avail / cols))) : CELL;
    boardEl.style.setProperty("--cell", `${size}px`);
    boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    cellEls = cells.map((_, i) => {
      const d = el("div", "mine-cell");
      d.addEventListener("pointerenter", () => {
        if (cheat) pixel.style.background = cells[i].mine ? "#000" : "#fff";
      });
      boardEl.appendChild(d);
      return d;
    });
    cells.forEach((_, i) => paint(i));
  }

  function resizeWindow() {
    if (isMobile()) return;
    const size = CELL;
    const w = Math.min(innerWidth - 16, cols * size + 36);
    const h = Math.min(innerHeight - 42, rows * size + 122);
    ctx.win.el.style.width = `${w}px`;
    ctx.win.el.style.height = `${h}px`;
  }

  /* ---------- 输入 ---------- */

  /* 长按插旗（触屏）：按住 450ms 视作右键 */
  let pressTimer: number | undefined;
  let suppress = false;

  boardEl.addEventListener("pointerdown", (e) => {
    const cell = (e.target as HTMLElement).closest(".mine-cell");
    if (!cell) return;
    if (!dead && !won) setFace("oh");
    suppress = false;
    if (e.pointerType === "touch") {
      const i = cellEls.indexOf(cell as HTMLElement);
      pressTimer = window.setTimeout(() => {
        suppress = true;
        cycleMark(i);
      }, 450);
    }
  });
  const cancelPress = () => {
    clearTimeout(pressTimer);
    setFace(dead ? "dead" : won ? "cool" : "idle");
  };
  boardEl.addEventListener("pointerup", cancelPress);
  boardEl.addEventListener("pointercancel", cancelPress);
  boardEl.addEventListener("pointerleave", cancelPress);

  boardEl.addEventListener("click", (e) => {
    const cell = (e.target as HTMLElement).closest(".mine-cell");
    if (!cell || suppress) return;
    const i = cellEls.indexOf(cell as HTMLElement);
    if (!cellsPlaced && !cells[i].open) {
      placeMines(i);
      cellsPlaced = true;
      startTimer();
    }
    openCell(i);
  });

  /* 右键标记；触屏长按弹出的 contextmenu 也一并吞掉 */
  boardEl.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const cell = (e.target as HTMLElement).closest(".mine-cell");
    if (!cell) return;
    cycleMark(cellEls.indexOf(cell as HTMLElement));
  });

  boardEl.addEventListener("dblclick", (e) => {
    const cell = (e.target as HTMLElement).closest(".mine-cell");
    if (!cell) return;
    chord(cellEls.indexOf(cell as HTMLElement));
  });

  face.addEventListener("click", () => newGame());

  /* ---------- 键盘：F2 新局 + XYZZY ---------- */

  let buf = "";
  const onKey = (e: KeyboardEvent) => {
    if (!ctx.win.el.classList.contains("focused")) return;
    if (e.key === "F2") {
      e.preventDefault();
      newGame();
      return;
    }
      if (/^[a-z]$/i.test(e.key)) {
        buf = (buf + e.key.toLowerCase()).slice(-5);
        if (buf === "xyzzy" && !cheat) {
          cheat = true;
          pixel.classList.add("on");
          help.textContent = MINE.cheatHint;
          stats.once("egg.xyzzy");
        }
      }
  };
  window.addEventListener("keydown", onKey);

  ctl = {
    newGame: () => newGame(),
    setLevel: (i: number) => {
      levelIdx = i;
      MINE_LEVELS.forEach((lv, n) => {
        levelItems[n].label = `${lv.label}${n === i ? " ✓" : ""}`;
      });
      newGame();
    },
    showBest: () => {
      const lines = MINE_LEVELS.map((lv) => {
        const t = Number(store.get(BEST_KEY + lv.key) ?? 0);
        return t ? MINE.bestRow(lv.label, t) : `${lv.label}：--`;
      });
      wm.msgBox(MINE.bestTitle, lines.some((l) => !l.endsWith("--")) ? lines.join("\n") : MINE.bestEmpty, "info");
    },
  };

  newGame();
  resizeWindow();

  return () => {
    stopTimer();
    clearTimeout(pressTimer);
    window.removeEventListener("keydown", onKey);
    ctl = null;
  };
}

/* 菜单里的难度项，构建后由 setLevel 动态打勾（下拉每次点击重建，改文案即生效） */
const levelItems = MINE_LEVELS.map((lv, i) => ({
  label: `${lv.label}${i === 0 ? " ✓" : ""}`,
  action: () => ctl?.setLevel(i),
}));

export const mineApp: AppDef = {
  id: "mine",
  title: "扫雷",
  icon: "mine",
  width: 200,
  height: 320,
  menus: [
    {
      label: "游戏",
      items: [
        { label: "新局", action: () => ctl?.newGame() },
        { label: "", sep: true },
        ...levelItems,
        { label: "", sep: true },
        { label: MINE.bestTitle, action: () => ctl?.showBest() },
      ],
    },
    {
      label: "帮助",
      items: [
        { label: "关于扫雷", action: () => wm.msgBox("关于扫雷", MINE.about, "help") },
      ],
    },
  ],
  build,
};
