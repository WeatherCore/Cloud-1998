/* 窗口菜单栏（记事本等程序的 文件/编辑/格式 下拉菜单） */

import type { AppCtx, MenuGroup } from "../core/types";
import { el } from "../core/util";

/* 全局点击关闭所有下拉（一次注册，所有菜单栏共用） */
let globalCloseBound = false;

export function buildMenubar(groups: MenuGroup[], ctx: () => AppCtx): HTMLElement {
  const bar = el("div", "w98-menubar");

  if (!globalCloseBound) {
    globalCloseBound = true;
    document.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".w98-menubar")) return;
      closeAll(bar);
    });
  }

  groups.forEach((g) => {
    const btn = el("button", "", g.label);
    btn.type = "button";

    btn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    btn.addEventListener("click", () => {
      if (btn.classList.contains("open")) {
        closeAll(bar);
        return;
      }
      closeAll(bar);
      btn.classList.add("open");
      const dd = el("div", "w98-dropdown");
      g.items.forEach((it) => {
        if (it.sep) {
          dd.appendChild(el("div", "menu-sep"));
          return;
        }
        const item = el("div", `dd-item${it.disabled ? " disabled" : ""}`, it.label);
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          closeAll(bar);
          it.action?.(ctx());
        });
        dd.appendChild(item);
      });
      btn.appendChild(dd);
    });

    bar.appendChild(btn);
  });

  return bar;
}

function closeAll(scope: HTMLElement) {
  document
    .querySelectorAll(".w98-menubar button.open")
    .forEach((b) => b.classList.remove("open"));
  document
    .querySelectorAll(".w98-dropdown")
    .forEach((d) => d.remove());
  void scope;
}
