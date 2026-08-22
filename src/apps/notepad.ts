/* 签名.txt - 记事本：励志签名收藏，带菜单栏小彩蛋 */

import type { AppCtx, AppDef } from "../core/types";
import { DIALOGS, QUOTES } from "../core/content";
import { el } from "../core/util";
import { wm } from "../core/wm";

function notepadText(): string {
  const list = QUOTES.map((q, i) => `${String(i + 1).padStart(2, "0")}. ${q}`).join("\n");
  return `【签名收藏】\n\n${list}\n\n\n想加新签名？打开 src/core/content.ts，\n把你的话写进 QUOTES 列表。\n`;
}

function build(ctx: AppCtx) {
  const wrap = el("div", "notepad-wrap");
  const ta = el("textarea") as HTMLTextAreaElement;
  ta.value = notepadText();
  ta.spellcheck = false;
  wrap.appendChild(ta);
  ctx.body.appendChild(wrap);
}

export const notepadApp: AppDef = {
  id: "notepad",
  title: "签名.txt - 记事本",
  icon: "text",
  width: 460,
  height: 420,
  menus: [
    {
      label: "文件",
      items: [
        {
          label: "保存",
          action: () => wm.msgBox("记事本", DIALOGS.notepadSave, "warn"),
        },
        { label: "", sep: true },
        { label: "退出", action: (ctx2) => ctx2.win.close() },
      ],
    },
    {
      label: "编辑",
      items: [
        {
          label: "时间/日期",
          action: (ctx2) => {
            const ta = ctx2.body.querySelector("textarea");
            if (!ta) return;
            const now = new Date().toLocaleString("zh-CN", { hour12: false });
            const s = ta.selectionStart;
            ta.value = ta.value.slice(0, s) + now + ta.value.slice(ta.selectionEnd);
            ta.focus();
          },
        },
        {
          label: "全选",
          action: (ctx2) => {
            const ta = ctx2.body.querySelector("textarea");
            ta?.select();
          },
        },
      ],
    },
    {
      label: "格式",
      items: [
        {
          label: "自动换行",
          action: (ctx2) => {
            const ta = ctx2.body.querySelector("textarea");
            if (ta) ta.wrap = ta.wrap === "off" ? "soft" : "off";
          },
        },
      ],
    },
    {
      label: "帮助",
      items: [
        {
          label: "关于记事本",
          action: () => wm.msgBox("关于记事本", DIALOGS.notepadAbout, "info"),
        },
      ],
    },
  ],
  build,
};
