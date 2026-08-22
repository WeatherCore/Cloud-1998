/* 任务栏 + 开始菜单 + 时钟 */

import { DESKTOP_ICONS, getApp } from "../apps";
import { DIALOGS, SITE } from "./content";
import { showShutdown } from "./fx";
import { iconEl, iconURL } from "../ui/pixel";
import { el } from "./util";
import { wm } from "./wm";

export function initTaskbar() {
  const bar = el("div");
  bar.id = "taskbar";

  /* 开始按钮 */
  const start = el("button", "", "");
  start.id = "start-btn";
  start.type = "button";
  start.innerHTML = `<img src="${iconURL("logo")}" alt="">`;
  start.appendChild(el("span", "", "开始"));

  const btns = el("div", "task-btns");
  btns.id = "task-btns";

  const tray = el("div");
  tray.id = "tray";
  const clock = el("span");
  clock.id = "clock";
  tray.appendChild(clock);

  bar.append(start, btns, tray);
  document.body.appendChild(bar);

  /* 开始菜单 */
  const menu = el("div");
  menu.id = "start-menu";
  const banner = el("div", "banner");
  banner.appendChild(el("span", "", `${SITE.osName}`));
  menu.appendChild(banner);

  DESKTOP_ICONS.forEach((id) => {
    const app = getApp(id);
    if (!app) return;
    menu.appendChild(menuItem(app.title, app.icon, () => wm.open(id)));
  });
  menu.appendChild(el("div", "menu-sep"));
  menu.appendChild(
    menuItem("帮助", "help", () => wm.msgBox("帮助", DIALOGS.systemAbout, "help"))
  );
  menu.appendChild(menuItem("关机...", "power", () => showShutdown()));
  document.body.appendChild(menu);

  const closeMenu = () => {
    menu.classList.remove("open");
    start.classList.remove("on");
  };
  start.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("open");
    start.classList.toggle("on", open);
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.target instanceof Node && menu.contains(e.target)) return;
    if ((e.target as HTMLElement).closest("#start-btn")) return;
    closeMenu();
  });
  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".menu-item")) closeMenu();
  });

  /* 时钟 */
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clock.textContent = `${hh}:${mm}`;
    clock.title = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  tick();
  setInterval(tick, 15000);
}

function menuItem(label: string, icon: string, action: () => void): HTMLElement {
  const item = el("div", "menu-item");
  item.appendChild(iconEl(icon, 26));
  item.appendChild(el("span", "", label));
  item.addEventListener("click", action);
  return item;
}
