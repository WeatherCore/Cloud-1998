/* ============================================================
   窗口管理器：拖拽 / 焦点 / 最小化 / 最大化 / 任务栏联动 / 对话框
   ============================================================ */

import { GLYPHS, iconEl, iconURL } from "../ui/pixel";
import { buildMenubar } from "../ui/menubar";
import type { AppCtx, AppDef } from "./types";
import { $, clamp, el, isMobile } from "./util";

const TASKBAR_H = 30;

export interface WinHandle {
  el: HTMLElement;
  body: HTMLElement;
  setTitle(text: string): void;
  close(): void;
}

interface WinInst {
  appId: string;
  el: HTMLElement;
  body: HTMLElement;
  titleText: HTMLElement;
  btnMax: HTMLButtonElement;
  minimized: boolean;
  maximized: boolean;
  prev: { l: number; t: number; w: number; h: number } | null;
  cleanup: (() => void) | undefined;
  taskBtn: HTMLButtonElement;
  dialog: boolean;
}

class WindowManager {
  private apps = new Map<string, AppDef>();
  private wins: WinInst[] = [];
  private z = 100;
  private cascade = 0;
  private dlgSeq = 0;

  init(apps: AppDef[]) {
    apps.forEach((a) => this.apps.set(a.id, a));
  }

  open(appId: string) {
    const app = this.apps.get(appId);
    if (!app) return;
    const existing = this.wins.find((w) => w.appId === appId);
    if (existing) {
      this.restore(existing);
      this.focus(existing);
      return;
    }
    this.create(app, false);
  }

  get focused(): WinInst | null {
    return this.wins.find((w) => w.el.classList.contains("focused")) ?? null;
  }

  /* ---------- 创建 ---------- */

  private create(app: AppDef, isDialog: boolean): WinInst {
    const mobile = isMobile();
    const win = el("div", "w98-window");
    const vw = innerWidth;
    const vh = innerHeight - TASKBAR_H;

    if (mobile) {
      win.classList.add("mobile");
    } else {
      const w = Math.min(app.width, vw - 16);
      const h = Math.min(app.height, vh - 12);
      win.style.width = `${w}px`;
      win.style.height = `${h}px`;
      const off = this.cascade * 24;
      win.style.left = `${clamp(Math.round((vw - w) / 2) - 30 + off, 0, vw - w)}px`;
      win.style.top = `${clamp(Math.round((vh - h) / 2) - 24 + off, 0, vh - h)}px`;
      this.cascade = (this.cascade + 1) % 7;
    }

    /* 标题栏 */
    const tb = el("div", "w98-titlebar");
    const tIcon = iconEl(app.icon, 16);
    tIcon.className = "title-icon";
    const tt = el("span", "title-text", app.title);
    const btns = el("div", "titlebar-btns");
    const bMin = mkTBtn(GLYPHS.min);
    const bMax = mkTBtn(GLYPHS.max);
    const bClose = mkTBtn(GLYPHS.close);
    btns.append(bMin, bMax, bClose);
    tb.append(tIcon, tt, btns);

    const body = el("div", `w98-body${app.flush ? " flush" : ""}`);
    win.append(tb, body);
    $("#desktop")!.appendChild(win);

    const inst: WinInst = {
      appId: isDialog ? `${app.id}#dlg${++this.dlgSeq}` : app.id,
      el: win,
      body,
      titleText: tt,
      btnMax: bMax,
      minimized: false,
      maximized: false,
      prev: null,
      cleanup: undefined,
      taskBtn: null as unknown as HTMLButtonElement,
      dialog: isDialog,
    };
    this.wins.push(inst);

    /* 任务栏按钮 */
    const bar = $("#task-btns");
    if (bar) {
      const btn = el("button", "task-btn");
      btn.appendChild(iconEl(app.icon, 16));
      btn.appendChild(el("span", "", app.title));
      btn.addEventListener("click", () => {
        if (inst.minimized) {
          this.restore(inst);
          this.focus(inst);
        } else if (this.focused === inst) {
          this.minimize(inst);
        } else {
          this.focus(inst);
        }
      });
      bar.appendChild(btn);
      inst.taskBtn = btn;
    }

    /* 事件 */
    win.addEventListener("pointerdown", () => this.focus(inst));
    bClose.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close(inst);
    });
    bMin.addEventListener("click", (e) => {
      e.stopPropagation();
      this.minimize(inst);
    });
    if (!mobile) {
      bMax.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMax(inst);
      });
    } else {
      bMax.style.display = "none";
    }
    this.enableDrag(inst, tb);

    const handle: WinHandle = {
      el: win,
      body,
      setTitle: (t) => {
        tt.textContent = t;
        const span = inst.taskBtn?.querySelector("span");
        if (span) span.textContent = t;
      },
      close: () => this.close(inst),
    };
    const ctx: AppCtx = {
      body,
      win: handle,
      open: (id) => this.open(id),
    };
    if (app.menus) {
      win.insertBefore(buildMenubar(app.menus, () => ctx), body);
    }
    inst.cleanup = app.build(ctx) ?? undefined;
    this.focus(inst);
    return inst;
  }

  /* ---------- 拖拽 ---------- */

  private enableDrag(inst: WinInst, tb: HTMLElement) {
    let sx = 0;
    let sy = 0;
    let ol = 0;
    let ot = 0;
    let dragging = false;
    tb.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".tbtn")) return;
      if (inst.maximized || isMobile()) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      ol = inst.el.offsetLeft;
      ot = inst.el.offsetTop;
      tb.setPointerCapture(e.pointerId);
    });
    tb.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const w = inst.el.offsetWidth;
      const nl = clamp(ol + e.clientX - sx, -w + 60, innerWidth - 60);
      const nt = clamp(ot + e.clientY - sy, 0, innerHeight - TASKBAR_H - 24);
      inst.el.style.left = `${nl}px`;
      inst.el.style.top = `${nt}px`;
    });
    const stop = () => (dragging = false);
    tb.addEventListener("pointerup", stop);
    tb.addEventListener("pointercancel", stop);
  }

  /* ---------- 状态 ---------- */

  focus(inst: WinInst) {
    if (inst.minimized) this.restore(inst);
    this.wins.forEach((w) => {
      w.el.classList.toggle("focused", w === inst);
      w.taskBtn?.classList.toggle("active", w === inst);
    });
    inst.el.style.zIndex = String(++this.z);
  }

  minimize(inst: WinInst) {
    inst.minimized = true;
    inst.el.style.display = "none";
    inst.taskBtn?.classList.remove("active");
    inst.el.classList.remove("focused");
  }

  restore(inst: WinInst) {
    inst.minimized = false;
    inst.el.style.display = "";
  }

  toggleMax(inst: WinInst) {
    if (!inst.maximized) {
      inst.prev = {
        l: inst.el.offsetLeft,
        t: inst.el.offsetTop,
        w: inst.el.offsetWidth,
        h: inst.el.offsetHeight,
      };
      Object.assign(inst.el.style, {
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
      });
      inst.maximized = true;
      inst.btnMax.innerHTML = GLYPHS.restore;
    } else if (inst.prev) {
      Object.assign(inst.el.style, {
        left: `${inst.prev.l}px`,
        top: `${inst.prev.t}px`,
        width: `${inst.prev.w}px`,
        height: `${inst.prev.h}px`,
      });
      inst.maximized = false;
      inst.btnMax.innerHTML = GLYPHS.max;
    }
  }

  close(inst: WinInst) {
    try {
      inst.cleanup?.();
    } catch {
      /* 程序清理出错不影响窗口系统 */
    }
    inst.el.remove();
    inst.taskBtn?.remove();
    this.wins = this.wins.filter((w) => w !== inst);
    const top = this.wins.filter((w) => !w.minimized).pop();
    if (top) this.focus(top);
  }

  /** 关闭全部窗口（关机用） */
  closeAll() {
    [...this.wins].forEach((w) => this.close(w));
  }

  /* ---------- 对话框 ---------- */

  private dialog(
    title: string,
    icon: string,
    html: string,
    buttons: { label: string; onClick?: () => void }[],
    width = 360,
    onClose?: () => void,
    inputValue?: string
  ): WinInst {
    const app: AppDef = {
      id: `dlg-${icon}`,
      title,
      icon,
      width,
      height: 120,
      build: (ctx) => {
        const wrap = el("div", "w98-dialog-body");
        const ic = el("div", "dlg-icon");
        ic.innerHTML = `<img src="${iconURL(icon)}" width="34" height="34" alt="">`;
        const txt = el("div", "dlg-text");
        txt.innerHTML = html;
        wrap.append(ic, txt);
        const row = el("div", "w98-dialog-btns");
        let firstBtn: HTMLButtonElement | undefined;
        buttons.forEach((b) => {
          const btn = el("button", "w98-btn", b.label);
          if (!firstBtn) firstBtn = btn;
          btn.addEventListener("click", () => {
            b.onClick?.();
            ctx.win.close();
          });
          row.appendChild(btn);
        });
        const parts: HTMLElement[] = [wrap];
        if (inputValue !== undefined) {
          const input = el("input", "w98-input dlg-input");
          input.type = "text";
          input.maxLength = 24;
          input.value = inputValue;
          /* 回车即确定 */
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              firstBtn?.click();
            }
          });
          parts.push(input);
        }
        parts.push(row);
        ctx.body.append(...parts);
        ctx.win.el.classList.add("dialog");
        ctx.win.el.style.height = "auto";
        ctx.win.el.style.minHeight = "0";
        /* 对话框居中 */
        if (!isMobile()) {
          const w = ctx.win.el.offsetWidth;
          ctx.win.el.style.left = `${Math.max(8, Math.round((innerWidth - w) / 2))}px`;
          ctx.win.el.style.top = `${Math.max(8, Math.round((innerHeight - TASKBAR_H - 160) / 2.4))}px`;
        }
      },
    };
    const inst = this.create(app, true);
    if (inputValue !== undefined) {
      /* 窗口建好再聚焦，全选方便直接键入覆盖 */
      setTimeout(() => {
        const inp = inst.el.querySelector<HTMLInputElement>(".dlg-input");
        inp?.focus();
        inp?.select();
      }, 0);
    }
    if (onClose) {
      const prev = inst.cleanup;
      inst.cleanup = () => {
        prev?.();
        onClose();
      };
    }
    return inst;
  }

  msgBox(title: string, html: string, icon = "info") {
    this.dialog(title, icon, html, [{ label: "确定" }]);
  }

  confirmBox(title: string, html: string): Promise<boolean> {
    return new Promise((resolve) => {
      let result = false;
      this.dialog(
        title,
        "warn",
        html,
        [{ label: "确定", onClick: () => (result = true) }, { label: "取消" }],
        360,
        () => resolve(result)
      );
    });
  }

  /** 带输入框的对话框；确定返回输入内容（原样），取消返回 null */
  promptBox(title: string, html: string, value = ""): Promise<string | null> {
    return new Promise((resolve) => {
      let result: string | null = null;
      const inst = this.dialog(
        title,
        "floppy",
        html,
        [
          {
            label: "确定",
            onClick: () => {
              const inp = inst.el.querySelector<HTMLInputElement>(".dlg-input");
              result = inp ? inp.value : "";
            },
          },
          { label: "取消" },
        ],
        360,
        () => resolve(result),
        value
      );
    });
  }
}

function mkTBtn(svg: string): HTMLButtonElement {
  const b = el("button", "tbtn");
  b.type = "button";
  b.innerHTML = svg;
  b.setAttribute("aria-label", "窗口按钮");
  return b;
}

export const wm = new WindowManager();
