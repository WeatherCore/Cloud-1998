/* 回收站 + 回收站里的「前任代码」 */

import type { AppCtx, AppDef } from "../core/types";
import { RECYCLE } from "../core/content";
import { el } from "../core/util";
import { iconEl } from "../ui/pixel";
import { wm } from "../core/wm";

function buildBin({ body }: AppCtx) {
  const wrap = el("div", "bin-wrap");
  const toolbar = el("div", "bin-toolbar");
  const emptyBtn = el("button", "w98-btn small", "清空回收站");
  toolbar.appendChild(emptyBtn);

  const list = el("div", "bin-list");
  const status = el("div", "bin-status", `1 个对象`);

  const renderRow = () => {
    list.innerHTML = "";
    const row = el("div", "bin-row");
    row.appendChild(iconEl("text", 22));
    row.appendChild(el("span", "bin-name", RECYCLE.file));
    row.appendChild(
      el(
        "span",
        "bin-meta",
        `${RECYCLE.size} · 删除于 ${RECYCLE.deletedAt}`
      )
    );
    row.addEventListener("click", () => row.classList.add("selected"));
    row.addEventListener("dblclick", () => wm.open("binfile"));
    list.appendChild(row);
  };
  renderRow();

  emptyBtn.addEventListener("click", async () => {
    if (!list.children.length) {
      wm.msgBox("回收站", "回收站已经是空的。心无杂念。", "info");
      return;
    }
    const yes = await wm.confirmBox("确认删除", RECYCLE.confirmEmpty);
    if (yes) {
      list.innerHTML = "";
      const empty = el("div", "bin-empty", "（空）");
      list.appendChild(empty);
      status.textContent = "0 个对象";
      wm.msgBox("回收站", RECYCLE.emptied, "info");
    }
  });

  wrap.append(toolbar, list, status);
  body.appendChild(wrap);
}

function buildBinFile({ body }: AppCtx) {
  const wrap = el("div", "code-view");
  const pre = el("pre");
  pre.textContent = RECYCLE.code.join("\n");
  wrap.appendChild(pre);
  body.appendChild(wrap);
}

export const binApp: AppDef = {
  id: "bin",
  title: "回收站",
  icon: "bin",
  width: 420,
  height: 300,
  build: buildBin,
};

export const binFileApp: AppDef = {
  id: "binfile",
  title: `${RECYCLE.file} - 记事本`,
  icon: "text",
  width: 480,
  height: 380,
  build: buildBinFile,
};
