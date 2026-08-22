/* 我的文档：作品集文件夹。列表双击开项目详情，星数/语言现场拉真实数据 */

import type { AppCtx, AppDef } from "../core/types";
import { PROJECTS, SITE, type Project } from "../core/content";
import { el, isMobile } from "../core/util";
import { iconEl } from "../ui/pixel";
import { wm } from "../core/wm";
import { LANG_COLORS } from "./github";

/* ---------- 文件夹列表 ---------- */

function buildDocs({ body }: AppCtx) {
  const wrap = el("div", "docs-wrap");
  const list = el("div", "docs-list");
  const status = el("div", "docs-status", `${PROJECTS.length} 个项目 · 双击查看详情`);

  PROJECTS.forEach((p) => {
    const row = el("div", "docs-row");
    row.appendChild(iconEl(p.icon, 22));
    const text = el("div", "docs-text");
    text.appendChild(el("div", "docs-name", p.name));
    text.appendChild(el("div", "docs-desc", p.desc));
    row.appendChild(text);

    row.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isMobile()) {
        openProject(p);
        return;
      }
      list
        .querySelectorAll(".docs-row.selected")
        .forEach((n) => n.classList.remove("selected"));
      row.classList.add("selected");
    });
    row.addEventListener("dblclick", () => openProject(p));

    list.appendChild(row);
  });

  wrap.append(list, status);
  body.appendChild(wrap);
}

/* ---------- 项目详情 ---------- */

let current: Project = PROJECTS[0];
let repaint: ((p: Project) => void) | null = null;
/** 当前详情窗口实际渲染的项目（用于判断是否需要重画） */
let painted: Project | null = null;

/** 打开（或切换到）某个项目的详情窗口 */
export function openProject(p: Project) {
  current = p;
  wm.open("project");
  /* wm.open 对已存在的窗口只恢复+聚焦，不重跑 build；
     新建窗口时 build 已同步 paint 过 current（painted === p），
     只有内容不是目标项目时才需要手动重画——避免定时器竞态把内容切回旧项目 */
  if (repaint && painted !== p) repaint(p);
}

function buildProject(ctx: AppCtx) {
  const { body, win } = ctx;
  const wrap = el("div", "pj-wrap");
  body.appendChild(wrap);

  let aborted = false;

  const loadLive = async (name: string, target: HTMLElement) => {
    const key = `wc98-repo-${name}`;
    let data: { s: number; lang: string | null; pushed: string } | undefined;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached && Date.now() - JSON.parse(cached).t < 5 * 60 * 1000) {
        data = JSON.parse(cached).d;
      }
    } catch {
      /* 缓存坏了就重新拉 */
    }
    if (!data) {
      try {
        const res = await fetch(`https://api.github.com/repos/${SITE.githubUser}/${name}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = await res.json();
        data = { s: j.stargazers_count, lang: j.language, pushed: j.pushed_at };
        sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
      } catch {
        if (!aborted) target.textContent = "（实时数据暂时读不到，不影响介绍）";
        return;
      }
    }
    if (aborted) return;
    const dot = data.lang
      ? `<i class="lang-dot" style="background:${
          LANG_COLORS[data.lang] ?? "#808080"
        }"></i>${data.lang}`
      : "未知语言";
    target.innerHTML = `★ ${data.s} · ${dot} · 更新于 ${data.pushed.slice(0, 10)}`;
  };

  const paint = (p: Project) => {
    win.setTitle(p.name);
    wrap.innerHTML = "";

    const head = el("div", "pj-head");
    const iconBox = el("div", "pj-icon");
    iconBox.appendChild(iconEl(p.icon, 40));
    const headText = el("div");
    headText.innerHTML = `<div class="pj-name">${p.name}</div>
      <a class="pj-repo" href="https://github.com/${SITE.githubUser}/${p.name}" target="_blank" rel="noopener">github.com/${SITE.githubUser}/${p.name}</a>`;
    head.append(iconBox, headText);

    const desc = el("div", "pj-desc", p.detail);

    const tags = el("div", "pj-tags");
    p.tags.forEach((t) => tags.appendChild(el("span", "tag", t)));

    const live = el("div", "pj-live", "读取中...");

    const btnRow = el("div", "btn-row");
    const btn = el("button", "w98-btn", "打开 GitHub 仓库");
    btn.addEventListener("click", () =>
      window.open(`https://github.com/${SITE.githubUser}/${p.name}`, "_blank", "noopener")
    );
    btnRow.appendChild(btn);

    wrap.append(head, desc, tags, live, btnRow);
    loadLive(p.name, live);
    painted = p;
  };

  repaint = paint;
  paint(current);

  return () => {
    aborted = true;
    repaint = null;
    painted = null;
  };
}

export const docsApp: AppDef = {
  id: "docs",
  title: "我的文档",
  icon: "folder",
  width: 480,
  height: 340,
  build: buildDocs,
};

export const projectApp: AppDef = {
  id: "project",
  title: "项目详情",
  icon: "folder",
  width: 440,
  height: 400,
  build: buildProject,
};
