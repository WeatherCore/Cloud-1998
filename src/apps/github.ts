/* 我的电脑：实时拉取 GitHub 公开数据（零后端的活数据） */

import type { AppCtx, AppDef } from "../core/types";
import { SITE } from "../core/content";
import { el } from "../core/util";
import { iconURL } from "../ui/pixel";

interface GHUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface GHRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
}

export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Shell: "#89e051",
  Lua: "#000080",
};

const CACHE_KEY = "wc98-gh-cache";
const CACHE_MS = 5 * 60 * 1000;

function build(ctx: AppCtx) {
  const { body } = ctx;
  const wrap = el("div", "gh-wrap");

  const toolbar = el("div", "gh-toolbar");
  toolbar.appendChild(el("span", "", "地址："));
  const addr = el("input", "w98-input gh-addr") as HTMLInputElement;
  addr.readOnly = true;
  addr.value = `api.github.com/users/${SITE.githubUser}`;
  toolbar.appendChild(addr);
  const reloadBtn = el("button", "w98-btn small", "刷新");
  toolbar.appendChild(reloadBtn);
  const homeBtn = el("button", "w98-btn small", "主页");
  homeBtn.addEventListener("click", () =>
    window.open(SITE.githubUrl, "_blank", "noopener")
  );
  toolbar.appendChild(homeBtn);

  const content = el("div", "gh-content");

  wrap.append(toolbar, content);
  body.appendChild(wrap);

  let aborted = false;
  let controller: AbortController | null = null;

  const load = async (force = false) => {
    if (controller) controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    content.innerHTML = "";
    const loading = el("div", "gh-loading");
    loading.innerHTML = `<div class="loadbar"><i></i></div>
      <div>正在连接 api.github.com，读取 ${SITE.githubUser} 的数据...</div>`;
    content.appendChild(loading);

    let user: GHUser | undefined;
    let repos: GHRepo[] = [];
    try {
      if (!force) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const { t, u, r } = JSON.parse(cached);
            if (Date.now() - t < CACHE_MS) {
              user = u;
              repos = r;
            }
          }
        } catch {
          /* 缓存损坏：清掉，走下面的重新拉取（不是网络错误） */
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
      if (!user) {
        const headers = { Accept: "application/vnd.github+json" };
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${SITE.githubUser}`, {
            signal,
            headers,
          }),
          fetch(
            `https://api.github.com/users/${SITE.githubUser}/repos?sort=pushed&per_page=5`,
            { signal, headers }
          ),
        ]);
        if (!uRes.ok) throw new Error(`HTTP ${uRes.status}`);
        user = (await uRes.json()) as GHUser;
        repos = (await rRes.json()) as GHRepo[];
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ t: Date.now(), u: user, r: repos })
        );
      }
      if (aborted) return;
      render(user!, repos);
    } catch (err) {
      if (aborted || (err as Error).name === "AbortError") return;
      content.innerHTML = "";
      const error = el("div", "gh-error");
      error.innerHTML = `<img src="${iconURL("warn")}" width="34" height="34" alt="">
        <div>
          <div><b>无法连接 GitHub。</b></div>
          <div class="gh-err-sub">可能是网络原因或接口限流（每小时 60 次），稍后再试。</div>
        </div>`;
      const retry = el("button", "w98-btn", "重试");
      retry.addEventListener("click", () => load(true));
      error.appendChild(retry);
      content.appendChild(error);
    }
  };

  const render = (u: GHUser, repos: GHRepo[]) => {
    content.innerHTML = "";
    const head = el("div", "gh-head");
    const headImg = el("img") as HTMLImageElement;
    headImg.width = 52;
    headImg.height = 52;
    headImg.alt = "";
    headImg.src = `https://github.com/${u.login}.png`;
    const headText = el("div");
    /* bio/name 来自 GitHub API，用 textContent 注入避免 HTML 执行 */
    headText.appendChild(el("div", "gh-name", u.name ?? u.login));
    headText.appendChild(el("div", "gh-bio", u.bio ?? "这个人很懒，什么都没留下。"));
    head.append(headImg, headText);

    const stats = el("div", "gh-stats");
    stats.innerHTML = `
      <div class="gh-stat"><b>${u.public_repos}</b><span>公开仓库</span></div>
      <div class="gh-stat"><b>${u.followers}</b><span>关注者</span></div>
      <div class="gh-stat"><b>${u.following}</b><span>正在关注</span></div>`;

    content.append(head, stats);

    if (repos.length) {
      const sub = el("div", "gh-sub", "最近更新的仓库");
      content.appendChild(sub);
      repos.forEach((r) => {
        const row = el("div", "repo");
        const link = document.createElement("a");
        link.href = r.html_url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = r.name;
        row.appendChild(link);
        if (r.description) row.appendChild(el("div", "repo-desc", r.description));
        const meta = el("div", "repo-meta");
        if (r.language) {
          const dot = el("i", "lang-dot");
          dot.style.background = LANG_COLORS[r.language] ?? "#808080";
          meta.appendChild(dot);
        }
        meta.appendChild(
          document.createTextNode(
            `${r.language ?? "未知语言"} · ★ ${r.stargazers_count} · ${r.pushed_at.slice(0, 10)}`
          )
        );
        row.appendChild(meta);
        content.appendChild(row);
      });
    }
  };

  reloadBtn.addEventListener("click", () => load(true));
  load();

  return () => {
    aborted = true;
    controller?.abort();
  };
}

export const githubApp: AppDef = {
  id: "github",
  title: "我的电脑",
  icon: "computer",
  width: 470,
  height: 460,
  build,
};
