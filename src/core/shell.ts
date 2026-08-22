/* 桌面外壳：图标、选择、双击打开、右键菜单、壁纸、欢迎气泡 */

import { DESKTOP_ICONS, getApp } from "../apps";
import { DIALOGS, SITE } from "./content";
import { iconEl } from "../ui/pixel";
import { clamp, el, isMobile } from "./util";
import { wm } from "./wm";
import { applyWallpaper, restoreWallpaper } from "./wallpapers";

interface CtxItem {
  label: string;
  icon?: string;
  sep?: boolean;
  action?: () => void;
}

export function initShell() {
  const desktop = el("div");
  desktop.id = "desktop";
  const iconsBox = el("div", "desktop-icons");

  const mobile = isMobile();
  DESKTOP_ICONS.forEach((id) => {
    const app = getApp(id);
    if (!app) return;
    const item = el("div", "desktop-icon");
    item.appendChild(iconEl(app.icon, 34));
    const label = el("div", "icon-label", app.title);
    item.appendChild(label);

    item.addEventListener("click", (e) => {
      e.stopPropagation();
      if (mobile) {
        wm.open(id);
        return;
      }
      document
        .querySelectorAll(".desktop-icon.selected")
        .forEach((n) => n.classList.remove("selected"));
      item.classList.add("selected");
    });
    item.addEventListener("dblclick", () => wm.open(id));

    iconsBox.appendChild(item);
  });

  desktop.appendChild(iconsBox);
  document.body.appendChild(desktop);

  /* 点空白处取消选择 */
  desktop.addEventListener("click", () => {
    document
      .querySelectorAll(".desktop-icon.selected")
      .forEach((n) => n.classList.remove("selected"));
  });

  /* 右键菜单 */
  desktop.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest(".w98-window")) return;
    popupMenu(e.clientX, e.clientY, [
      {
        label: "刷新",
        icon: "refresh",
        action: () => {
          const d = document.getElementById("desktop");
          if (d) {
            d.style.opacity = "0";
            requestAnimationFrame(() => (d.style.opacity = "1"));
          }
          showBalloon(DIALOGS.refresh);
        },
      },
      { label: "", sep: true },
      {
        label: "壁纸：草原",
        icon: "floppy",
        action: () =>
          void applyWallpaper("bliss").then(() => showBalloon(DIALOGS.wallpaper)),
      },
      {
        label: "壁纸：湖光",
        icon: "computer",
        action: () =>
          void applyWallpaper("lake").then(() => showBalloon(DIALOGS.wallpaper)),
      },
      {
        label: "更换壁纸...",
        icon: "help",
        action: () => wm.open("display"),
      },
      { label: "", sep: true },
      {
        label: "关于本系统",
        icon: "help",
        action: () => wm.msgBox("关于", DIALOGS.systemAbout, "info"),
      },
    ]);
  });

  /* 恢复上次的壁纸（用户壁纸走 IndexedDB，异步取；旧值一律回退草原） */
  restoreWallpaper();

  /* 开机欢迎气泡 */
  setTimeout(() => showBalloon(SITE.welcome), 900);
}

/** 桌面右键菜单 */
function popupMenu(x: number, y: number, items: CtxItem[]) {
  document.getElementById("ctx-menu")?.remove();
  const menu = el("div");
  menu.id = "ctx-menu";
  items.forEach((it) => {
    if (it.sep) {
      menu.appendChild(el("div", "menu-sep"));
      return;
    }
    const row = el("div", "menu-item");
    if (it.icon) row.appendChild(iconEl(it.icon, 18));
    row.appendChild(el("span", "", it.label));
    row.addEventListener("click", () => {
      menu.remove();
      it.action?.();
    });
    menu.appendChild(row);
  });
  document.body.appendChild(menu);
  menu.style.display = "block";
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  menu.style.left = `${clamp(x, 0, innerWidth - w - 4)}px`;
  menu.style.top = `${clamp(y, 0, innerHeight - h - 34)}px`;

  const close = (e: PointerEvent) => {
    if (e.target instanceof Node && menu.contains(e.target)) return;
    menu.remove();
    document.removeEventListener("pointerdown", close, true);
  };
  document.addEventListener("pointerdown", close, true);
  menu.addEventListener("contextmenu", (e) => e.preventDefault());
}

/** 任务栏上方的黄色气泡提示 */
export function showBalloon(text: string, ms = 6000) {
  document.getElementById("tip")?.remove();
  const tip = el("div");
  tip.id = "tip";
  tip.textContent = text;
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), ms);
}
