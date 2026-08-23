/* 任务栏 + 开始菜单 + 托盘（输入法/音量）+ 时钟日历 */

import { DESKTOP_ICONS, getApp } from "../apps";
import { DIALOGS, SITE, TRAY } from "./content";
import { showShutdown } from "./fx";
import { iconEl, iconURL } from "../ui/pixel";
import { sound } from "./sound";
import { el } from "./util";
import { wm } from "./wm";

/* 喇叭两态：正常 / 静音（红叉） */
const SVG_VOL = `<svg viewBox="0 0 14 14" width="14" height="14"><path d="M2 5 h2.4 L8 2 v10 L4.4 9 H2 z" fill="#000"/><path d="M9.5 4.6 q2 2.4 0 4.8" stroke="#000" fill="none" stroke-width="1.1"/><path d="M11 3.2 q3 3.8 0 7.6" stroke="#000" fill="none" stroke-width="1.1"/></svg>`;
const SVG_MUTED = `<svg viewBox="0 0 14 14" width="14" height="14"><path d="M2 5 h2.4 L8 2 v10 L4.4 9 H2 z" fill="#000"/><path d="M9.3 5 l3.4 3.4 M12.7 5 L9.3 8.4" stroke="#c00000" stroke-width="1.4"/></svg>`;

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

  /* 托盘：输入法徽标 + 音量（点击静音）+ 时钟 */
  const tray = el("div");
  tray.id = "tray";

  const ime = el("button", "tray-icon tray-ime", "中");
  ime.type = "button";
  ime.title = TRAY.ime;
  ime.addEventListener("click", () => {
    ime.textContent = ime.textContent === "中" ? "EN" : "中";
  });

  const vol = el("button", "tray-icon tray-vol");
  vol.type = "button";
  const paintVol = () => {
    const muted = sound.isMuted();
    vol.innerHTML = muted ? SVG_MUTED : SVG_VOL;
    vol.title = muted ? TRAY.unmute : TRAY.mute;
  };
  vol.addEventListener("click", () => {
    sound.toggleMute();
    paintVol();
  });
  paintVol();

  const clock = el("span");
  clock.id = "clock";
  tray.append(ime, vol, clock);

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

  /* 时钟：每 15 租秒对表；点击弹出本月日历 */
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clock.textContent = `${hh}:${mm}`;
    clock.title = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  tick();
  setInterval(tick, 15000);

  clock.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCalendar();
  });

  function toggleCalendar() {
    const existed = document.getElementById("clock-cal");
    existed?.remove();
    if (existed) return;

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const cal = el("div");
    cal.id = "clock-cal";
    cal.appendChild(el("div", "cal-title", TRAY.calTitle(y, m + 1)));
    const table = el("table");
    const head = el("tr");
    TRAY.calWeek.forEach((w) => head.appendChild(el("th", "", w)));
    table.appendChild(head);
    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    let row = el("tr");
    for (let i = 0; i < firstDay; i++) row.appendChild(el("td", "blank"));
    for (let d = 1; d <= days; d++) {
      row.appendChild(el("td", d === now.getDate() ? "today" : "", String(d)));
      if ((firstDay + d) % 7 === 0) {
        table.appendChild(row);
        row = el("tr");
      }
    }
    if (row.children.length) table.appendChild(row);
    cal.appendChild(table);
    document.body.appendChild(cal);

    const close = (ev: PointerEvent) => {
      if (ev.target instanceof Node && cal.contains(ev.target)) return;
      cal.remove();
      document.removeEventListener("pointerdown", close, true);
    };
    setTimeout(() => document.addEventListener("pointerdown", close, true), 0);
    cal.addEventListener("click", (ev) => ev.stopPropagation());
  }
}

function menuItem(label: string, icon: string, action: () => void): HTMLElement {
  const item = el("div", "menu-item");
  item.appendChild(iconEl(icon, 26));
  item.appendChild(el("span", "", label));
  item.addEventListener("click", action);
  return item;
}
