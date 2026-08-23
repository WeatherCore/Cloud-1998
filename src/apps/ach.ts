/* 成就：Steam 式成就页 —— 网格、进度、隐藏 ???、静音开关 */

import type { AppCtx, AppDef } from "../core/types";
import { ACH, ACHIEVEMENTS } from "../core/content";
import { achievements } from "../core/achievements";
import { sound } from "../core/sound";
import { stats } from "../core/stats";
import { iconEl } from "../ui/pixel";
import { el } from "../core/util";
import { wm } from "../core/wm";

function build(ctx: AppCtx) {
  const { body } = ctx;

  const wrap = el("div", "ach-wrap");

  /* 头部：奖杯 + 进度格 + 静音开关 */
  const head = el("div", "ach-head");
  const title = el("div", "ach-title");
  title.append(iconEl("trophy", 22), el("b", "", ACH.appName));
  const segs = el("div", "ach-segs");
  const count = el("span", "ach-count");
  const resetBtn = el("button", "w98-btn small", ACH.reset);
  resetBtn.type = "button";
  resetBtn.title = ACH.resetTitle;
  const muteBtn = el("button", "w98-btn small");
  muteBtn.type = "button";
  head.append(title, segs, count, resetBtn, muteBtn);

  const list = el("div", "ach-list");
  wrap.append(head, list);
  body.appendChild(wrap);

  const render = () => {
    const total = ACHIEVEMENTS.length;
    const n = achievements.count();
    count.textContent = ACH.progress(n, total);
    segs.innerHTML = "";
    for (let i = 0; i < total; i++) segs.appendChild(el("i", i < n ? "on" : ""));
    muteBtn.textContent = sound.isMuted() ? ACH.soundOff : ACH.soundOn;

    list.innerHTML = "";
    ACHIEVEMENTS.forEach((d) => {
      const got = achievements.isUnlocked(d.id);
      const card = el("div", `ach-card${got ? "" : " locked"}`);
      const ic = el("div", "ach-icon");
      ic.appendChild(iconEl(got ? d.icon : "help", 30));
      const mid = el("div", "ach-mid");
      const name = el("div", "ach-name", got || !d.hidden ? d.name : ACH.lockedName);
      const desc = el("div", "ach-desc", got ? d.desc : d.hidden ? ACH.lockedDesc : d.desc);
      mid.append(name, desc);
      card.append(ic, mid);
      if (got) {
        const date = new Date(achievements.unlockedAt(d.id)).toLocaleDateString("zh-CN");
        card.appendChild(el("div", "ach-date", ACH.unlockedAt(date)));
      } else {
        card.appendChild(el("div", "ach-date", "—"));
      }
      list.appendChild(card);
    });
  };

  resetBtn.addEventListener("click", async () => {
    const yes = await wm.confirmBox("重置成就", ACH.resetConfirm);
    if (!yes) return;
    /* 先清计数再清成就：顺序反过来会被 evaluate 补发回来 */
    stats.reset();
    achievements.reset();
    render();
    wm.msgBox("成就", ACH.resetDone, "info");
  });

  muteBtn.addEventListener("click", () => render());
  render();

  /* 窗口开着时实时刷新（比如同时弹窗解锁）；关窗退订，防监听累积 */
  const offUnlock = achievements.onUnlock(() => render());

  return () => {
    offUnlock();
  };
}

export const achApp: AppDef = {
  id: "ach",
  title: ACH.appName,
  icon: "trophy",
  width: 480,
  height: 480,
  menus: [
    {
      label: "帮助",
      items: [
        { label: "关于成就", action: () => wm.msgBox("关于成就", ACH.about, "trophy") },
      ],
    },
  ],
  build,
};
