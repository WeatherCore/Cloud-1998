/* 计算器：Win98 标准型。敲什么，显示屏里就实时显示什么。
   数字键下面埋了三个笑话。 */

import type { AppCtx, AppDef } from "../core/types";
import { CALC } from "../core/content";
import { stats } from "../core/stats";
import { el, reducedMotion } from "../core/util";
import { wm } from "../core/wm";

function build(ctx: AppCtx) {
  const { body } = ctx;

  const wrap = el("div", "calc-wrap");
  const display = el("div", "calc-display", "0");
  const keys = el("div", "calc-keys");
  wrap.append(display, keys);
  body.appendChild(wrap);

  /* 立即执行式引擎（先按 1 + 2 再按 =，不是表达式求值）：
     acc/op 是挂起的运算，entry 是正在敲的操作数，
     pre 是已经敲过去的前半段算式——两者拼起来就是显示屏的全部内容 */
  let acc: number | null = null;
  let op: string | null = null;
  let lastOperand: number | null = null;
  let lastOp: string | null = null;
  let pre = "";
  let entry = "";
  let fresh = true;
  let error = false;
  let afterEq = false;
  /* 连按 = 的次数（彩蛋计数） */
  let eqStreak = 0;

  const GLYPH: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  const fmt = (n: number): string => {
    if (!isFinite(n) || Math.abs(n) >= 1e16) return CALC.errOverflow;
    return String(parseFloat(n.toPrecision(12)));
  };

  const current = () => Number(entry || "0");

  /* 显示屏 = 前半段算式 + 正在敲的数；长了自动换小号字 */
  const render = () => {
    display.textContent = pre || entry ? pre + entry : "0";
    display.classList.toggle("long", (pre + entry).length > 12);
    check5318008();
  };

  /* 5318008：老计算器传统艺能，屏幕倒过来看 */
  const check5318008 = () => {
    if (display.textContent !== "5318008") return;
    if (stats.once("egg.5318008")) wm.msgBox("计算器", CALC.e5318008, "info");
    if (reducedMotion()) return;
    display.classList.add("flip");
    setTimeout(() => display.classList.remove("flip"), 2000);
  };

  const showError = (text: string) => {
    display.textContent = text;
    display.classList.remove("long");
    display.classList.remove("flip");
    display.classList.add("error");
    pre = "";
    entry = "";
    error = true;
    eqStreak = 0;
  };

  const apply = (a: number, b: number, o: string): number | null => {
    switch (o) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        if (b === 0) {
          if (stats.once("egg.div0")) wm.msgBox("计算器", CALC.div0Egg, "warn");
          showError(CALC.errDiv0);
          return null;
        }
        return a / b;
      default:
        return b;
    }
  };

  const digit = (d: string) => {
    if (error) {
      acc = null;
      op = null;
      error = false;
      display.classList.remove("error");
      pre = "";
      entry = "";
    }
    /* 出结果后敲新数字 = 开新的一笔 */
    if (afterEq) {
      pre = "";
      entry = "";
      afterEq = false;
    }
    if (d === ".") {
      if (!entry) {
        entry = "0.";
        render();
        return;
      }
      if (!entry.includes(".")) {
        entry += ".";
        render();
      }
      return;
    }
    if (!entry || entry === "0") {
      entry = d;
    } else if (entry.replace(/[-.]/g, "").length < 15) {
      entry += d;
    }
    fresh = false;
    render();
  };

  const backspace = () => {
    if (error || afterEq) return;
    entry =
      entry.length <= 1 || (entry.length === 2 && entry.startsWith("-"))
        ? ""
        : entry.slice(0, -1);
    render();
  };

  const setOp = (o: string) => {
    if (error) return;
    eqStreak = 0;
    afterEq = false;
    if (op !== null && !fresh) {
      /* 连续运算：先把上一段算出来，屏幕上算式原样接长 */
      const r = apply(acc ?? 0, current(), op);
      if (r === null) return;
      acc = r;
      pre = pre + entry + " " + GLYPH[o] + " ";
      entry = "";
    } else if (op !== null && pre) {
      /* 连按运算符：换掉末尾那个 */
      pre = pre.replace(/[+\-−×÷]\s*$/, GLYPH[o] + " ");
    } else {
      acc = current();
      pre = (entry || "0") + " " + GLYPH[o] + " ";
      entry = "";
    }
    op = o;
    fresh = true;
    render();
  };

  const equals = () => {
    if (error) return;
    eqStreak++;
    let r: number | null;
    if (op !== null) {
      const b = current();
      r = apply(acc ?? 0, b, op);
      lastOp = op;
      lastOperand = b;
      op = null;
      acc = null;
    } else if (lastOp !== null) {
      r = apply(current(), lastOperand ?? 0, lastOp);
    } else {
      return;
    }
    if (r === null) return;
    const text = fmt(r);
    display.textContent = text;
    display.classList.toggle("long", text.length > 12);
    display.classList.remove("error");
    pre = "";
    entry = text;
    fresh = true;
    afterEq = true;
    check5318008();

    /* 连按十次等号：计算器开始怀疑人生 */
    if (eqStreak >= 10) {
      stats.once("egg.equals10");
      const lines = CALC.equalsStreak;
      display.textContent = lines[Math.min(eqStreak - 10, lines.length - 1)];
      display.classList.add("error");
    }
  };

  const unary = (kind: "sqrt" | "inv" | "neg" | "pct") => {
    if (error) return;
    eqStreak = 0;
    afterEq = false;
    const v = current();
    let r: number;
    if (kind === "sqrt") {
      if (v < 0) {
        showError(CALC.errOverflow);
        return;
      }
      r = Math.sqrt(v);
    } else if (kind === "inv") {
      if (v === 0) {
        if (stats.once("egg.div0")) wm.msgBox("计算器", CALC.div0Egg, "warn");
        showError(CALC.errDiv0);
        return;
      }
      r = 1 / v;
    } else if (kind === "neg") {
      r = -v;
    } else {
      /* Win98 的 %：加减法算百分比，乘除法算百分率 */
      r = op === "+" || op === "-" ? ((acc ?? 0) * v) / 100 : v / 100;
    }
    entry = fmt(r);
    fresh = true;
    render();
  };

  const clearEntry = () => {
    display.classList.remove("error");
    error = false;
    entry = "";
    fresh = true;
    render();
  };

  const clearAll = () => {
    acc = null;
    op = null;
    lastOperand = null;
    lastOp = null;
    eqStreak = 0;
    pre = "";
    afterEq = false;
    clearEntry();
  };

  /* ---------- 按键面板 ---------- */

  type Key = { label: string; cls?: string; wide?: number; fn: () => void };
  const layout: Key[] = [
    { label: "退格", cls: "k-red", wide: 2, fn: backspace },
    { label: "CE", cls: "k-red", fn: clearEntry },
    { label: "C", cls: "k-red", wide: 2, fn: clearAll },
    { label: "7", fn: () => digit("7") },
    { label: "8", fn: () => digit("8") },
    { label: "9", fn: () => digit("9") },
    { label: "÷", cls: "k-red", fn: () => setOp("/") },
    { label: "√", fn: () => unary("sqrt") },
    { label: "4", fn: () => digit("4") },
    { label: "5", fn: () => digit("5") },
    { label: "6", fn: () => digit("6") },
    { label: "×", cls: "k-red", fn: () => setOp("*") },
    { label: "%", fn: () => unary("pct") },
    { label: "1", fn: () => digit("1") },
    { label: "2", fn: () => digit("2") },
    { label: "3", fn: () => digit("3") },
    { label: "−", cls: "k-red", fn: () => setOp("-") },
    { label: "1/x", fn: () => unary("inv") },
    { label: "0", fn: () => digit("0") },
    { label: "±", fn: () => unary("neg") },
    { label: ".", fn: () => digit(".") },
    { label: "+", cls: "k-red", fn: () => setOp("+") },
    { label: "=", cls: "k-red k-eq", fn: equals },
  ];

  layout.forEach((k) => {
    const b = el("button", `calc-key${k.cls ? ` ${k.cls}` : ""}`, k.label);
    b.type = "button";
    if (k.wide) b.style.gridColumn = `span ${k.wide}`;
    b.addEventListener("click", k.fn);
    keys.appendChild(b);
  });

  /* ---------- 键盘 ---------- */

  const KEYS: Record<string, () => void> = {
    "0": () => digit("0"),
    "1": () => digit("1"),
    "2": () => digit("2"),
    "3": () => digit("3"),
    "4": () => digit("4"),
    "5": () => digit("5"),
    "6": () => digit("6"),
    "7": () => digit("7"),
    "8": () => digit("8"),
    "9": () => digit("9"),
    ".": () => digit("."),
    "+": () => setOp("+"),
    "-": () => setOp("-"),
    "*": () => setOp("*"),
    "/": () => setOp("/"),
    Enter: equals,
    "=": equals,
    Backspace: backspace,
    Escape: clearAll,
    Delete: clearEntry,
    "%": () => unary("pct"),
    r: () => unary("inv"),
  };

  const onKey = (e: KeyboardEvent) => {
    if (!ctx.win.el.classList.contains("focused")) return;
    const fn = KEYS[e.key] ?? KEYS[e.code];
    if (!fn) return;
    e.preventDefault();
    fn();
  };
  window.addEventListener("keydown", onKey);

  return () => window.removeEventListener("keydown", onKey);
}

export const calcApp: AppDef = {
  id: "calc",
  title: "计算器",
  icon: "calc",
  width: 270,
  height: 330,
  menus: [
    {
      label: "编辑",
      items: [
        {
          label: "复制",
          action: async (ctx2) => {
            const d = ctx2.body.querySelector(".calc-display")?.textContent ?? "";
            try {
              await navigator.clipboard?.writeText(d);
            } catch {
              /* 没有剪贴板权限也不扫兴 */
            }
            wm.msgBox("计算器", CALC.copied, "info");
          },
        },
      ],
    },
    {
      label: "查看",
      items: [
        { label: "标准型 ✓", action: () => undefined },
        { label: "科学型", action: () => wm.msgBox("计算器", CALC.sciLocked, "warn") },
      ],
    },
    {
      label: "帮助",
      items: [
        { label: "关于计算器", action: () => wm.msgBox("关于计算器", CALC.about, "help") },
      ],
    },
  ],
  build,
};
