/* 我的浏览器：一张住在本机里的 1998 年内联网。
   不联任何真实网络——地址栏里输什么，都出不去这台电脑。 */

import type { AppCtx, AppDef } from "../core/types";
import { ABOUT, QUOTES, WEB } from "../core/content";
import { stats } from "../core/stats";
import { el, rand, store } from "../core/util";
import { wm } from "../core/wm";

/* 工具栏像素按钮（绿箭头 / 红 Stop / 蓝 刷新 / 棕主页） */
const TB: Record<string, string> = {
  back: `<svg viewBox="0 0 16 16" width="18" height="18"><path d="M10 2.5 L4.5 8 L10 13.5" fill="none" stroke="#006000" stroke-width="2.4"/><path d="M5.5 8 h7" stroke="#006000" stroke-width="2.4"/></svg>`,
  forward: `<svg viewBox="0 0 16 16" width="18" height="18"><path d="M6 2.5 L11.5 8 L6 13.5" fill="none" stroke="#006000" stroke-width="2.4"/><path d="M10.5 8 h-7" stroke="#006000" stroke-width="2.4"/></svg>`,
  stop: `<svg viewBox="0 0 16 16" width="18" height="18"><circle cx="8" cy="8" r="6.4" fill="#c00000"/><path d="M5.4 5.4 l5.2 5.2 M10.6 5.4 l-5.2 5.2" stroke="#fff" stroke-width="1.8"/></svg>`,
  refresh: `<svg viewBox="0 0 16 16" width="18" height="18"><path d="M13 8 a5 5 0 1 1 -1.8 -3.8" fill="none" stroke="#000080" stroke-width="2.2"/><path d="M10.5 1 L14 4.2 L10 5.4 z" fill="#000080"/></svg>`,
  home: `<svg viewBox="0 0 16 16" width="18" height="18"><path d="M8 2 L14.5 7 H12.5 V13.5 H3.5 V7 H1.5 z" fill="#a05000"/><rect x="6.6" y="9.5" width="2.8" height="4" fill="#ffe000"/></svg>`,
};

/* ---------- 留言板存档 ---------- */

const GB_KEY = "wc98-guestbook";

interface Post {
  name: string;
  date: string;
  text: string;
}

function loadPosts(): Post[] {
  try {
    const list = JSON.parse(store.get(GB_KEY) ?? "[]");
    return Array.isArray(list) ? list.slice(0, 30) : [];
  } catch {
    return [];
  }
}

/* ---------- 内部页面注册 ---------- */

interface Page {
  url: string;
  title: string;
  render(box: HTMLElement, go: (route: string) => void, refresh: () => void): void;
}

/* 便捷元素：带 class 和文本 */
const h = (tag: keyof HTMLElementTagNameMap, cls = "", text?: string) => {
  const n = el(tag, cls);
  if (text !== undefined) n.textContent = text;
  return n;
};

/* 站内链接 */
function link(label: string, to: string): HTMLAnchorElement {
  const a = el("a", "web-link", label);
  a.href = "#";
  a.dataset.to = to;
  return a;
}

/* 仿 GIF 计数器：黑底绿字数字牌 */
function counter(n: number, cls: string): HTMLElement {
  const box = h("span", `web-counter ${cls}`);
  String(n)
    .split("")
    .forEach((d) => box.appendChild(h("i", "", d)));
  return box;
}

const PAGES: Record<string, Page> = {
  /* ---- 云端导航（首页） ---- */
  nav: {
    url: WEB.nav.url,
    title: WEB.nav.title,
    render(box, go) {
      stats.bump("visit.nav");
      const head = h("div", "web-nav-head");
      head.appendChild(h("span", "web-nav-logo", "云"));
      head.appendChild(h("b", "web-nav-title", "云端导航"));
      head.appendChild(counter(1998 + stats.get("visit.nav"), "nav"));

      const marquee = h("div", "web-marquee");
      marquee.appendChild(h("span", "", WEB.nav.marquee));

      const cols = h("div", "web-nav-cols");
      WEB.nav.sections.forEach((sec) => {
        const cell = h("div", sec.name === "实用工具" ? "web-nav-cat corner" : "web-nav-cat");
        cell.appendChild(h("div", "web-nav-cat-title", sec.name));
        sec.links.forEach((lk) => {
          const a = link(lk.label, lk.to);
          if (lk.hide) a.classList.add("web-dim");
          cell.appendChild(h("div", "web-nav-item")).append(
            a,
            h("span", "web-nav-desc", lk.desc)
          );
        });
        cols.appendChild(cell);
      });

      const foot = h("div", "web-foot", WEB.nav.footer);
      box.append(head, marquee, cols, foot);
      void go;
    },
  },

  /* ---- WeatherCore 的个人主页 ---- */
  home: {
    url: WEB.home.url,
    title: WEB.home.title,
    render(box, go) {
      stats.bump("visit.home");
      const title = h("div", "web-home-title blink-ish", "★ WeatherCore 的家 ★");

      const marquee = h("div", "web-marquee");
      marquee.appendChild(h("span", "", WEB.home.marquee));

      const construct = h("div", "web-construct");
      construct.innerHTML = `<svg viewBox="0 0 40 24" width="52" height="32" shape-rendering="crispEdges"><rect x="0" y="14" width="40" height="4" fill="#000"/><rect x="0" y="18" width="40" height="4" fill="#ff8000"/><rect x="6" y="4" width="4" height="10" fill="#000"/><rect x="30" y="4" width="4" height="10" fill="#000"/><rect x="0" y="14" width="40" height="8" fill="none" stroke="#000"/></svg>`;
      const ctext = h("div");
      ctext.append(
        h("b", "", WEB.home.constructing),
        h("div", "web-dim", WEB.home.constructingSub)
      );
      construct.append(ctext);

      const hr = () => h("div", "web-hr");

      const intro = h("div", "web-sec");
      intro.append(h("div", "web-sec-title", WEB.home.sectionsTitle));
      ABOUT.lines.forEach((l) => intro.appendChild(h("p", "", l)));

      const profile = h("div", "web-sec");
      profile.append(h("div", "web-sec-title", WEB.home.profileTitle));
      const table = h("table", "web-table");
      ABOUT.facts.forEach(([k, v]) => {
        const tr = h("tr", "");
        tr.append(h("td", "web-k", k), h("td", "", v));
        table.appendChild(tr);
      });
      profile.appendChild(table);

      const motto = h("div", "web-sec");
      motto.append(h("div", "web-sec-title", WEB.home.mottoTitle));
      motto.appendChild(h("p", "web-motto", `「${QUOTES[rand(QUOTES.length)]}」`));

      const counterRow = h("div", "web-counter-row");
      counterRow.append(
        h("span", "", WEB.home.counter(88 + stats.get("visit.home"))),
        counter(88 + stats.get("visit.home"), "home")
      );

      /* 背景音乐按钮：一个关于 1998 年声卡物价的冷笑话 */
      const sound = el("button", "web-link web-btn", WEB.home.sound);
      sound.type = "button";
      sound.addEventListener("click", () => {
        stats.once("egg.soundcard");
        wm.msgBox("我的浏览器", WEB.home.soundHint, "warn");
      });

      /* 给我写信：信鸽还在培训 */
      const mail = el("button", "web-link web-btn", WEB.home.mail);
      mail.type = "button";
      mail.addEventListener("click", () => {
        stats.once("egg.mail");
        wm.msgBox("我的浏览器", WEB.home.mailHint, "info");
      });

      const flinks = h("div", "web-sec");
      flinks.append(h("div", "web-sec-title", WEB.home.linksTitle));
      const row = h("div", "web-flinks");
      WEB.home.links.forEach((lk, i) => {
        if (i) row.appendChild(h("span", "", " | "));
        row.appendChild(link(lk.label, lk.to));
      });
      row.append(h("span", "", " | "), sound, h("span", "", " | "), mail);
      flinks.appendChild(row);

      const foot = h("div", "web-foot", `© 1998 WeatherCore · ${WEB.home.url} · 本页由记事本手写，未用任何网页制作软件`);
      box.append(title, marquee, construct, hr(), intro, profile, motto, counterRow, flinks, hr(), foot);
      void go;
    },
  },

  /* ---- 留言板 ---- */
  guestbook: {
    url: WEB.guestbook.url,
    title: WEB.guestbook.title,
    render(box, go, refresh) {
      stats.bump("visit.guestbook");
      box.appendChild(h("div", "web-sec-title", `· ${WEB.guestbook.title} ·`));
      box.appendChild(h("p", "", WEB.guestbook.intro));

      const nick = el("input", "w98-input web-gb-nick") as HTMLInputElement;
      nick.maxLength = 12;
      nick.placeholder = WEB.guestbook.nickDefault;
      const text = el("textarea", "w98-input web-gb-text") as HTMLTextAreaElement;
      text.maxLength = 100;
      text.placeholder = WEB.guestbook.placeholder;
      const submit = el("button", "w98-btn", WEB.guestbook.submit);
      submit.type = "button";

      const form = h("div", "web-gb-form");
      const nickRow = h("label", "web-gb-row");
      nickRow.append(h("span", "", WEB.guestbook.nick), nick);
      form.append(nickRow, text, submit);

      const list = h("div", "web-gb-list");

      const renderList = () => {
        list.innerHTML = "";
        const user = loadPosts();
        if (!user.length) list.appendChild(h("div", "web-dim web-gb-empty", WEB.guestbook.empty));
        user.forEach((p) => list.appendChild(postRow(p, true)));
        WEB.guestbook.seed.forEach((p) => list.appendChild(postRow(p, false)));
      };

      const postRow = (p: Post, mine: boolean) => {
        const row = h("div", `web-gb-post${mine ? " mine" : ""}`);
        const head = h("div", "web-gb-head");
        head.append(h("b", "", p.name), h("span", "web-gb-date", p.date));
        row.append(head, h("div", "web-gb-text-row", p.text));
        return row;
      };

      submit.addEventListener("click", () => {
        const t = (text.value ?? "").trim();
        if (!t) return;
        const d = new Date();
        const post: Post = {
          name: (nick.value ?? "").trim() || WEB.guestbook.nickDefault,
          date: `1998-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
          text: t,
        };
        const posts = loadPosts();
        posts.unshift(post);
        store.set(GB_KEY, JSON.stringify(posts.slice(0, 30)));
        stats.bump("guestbook.posts");
        stats.once("egg.guestbook");
        text.value = "";
        renderList();
        wm.msgBox(WEB.guestbook.title, WEB.guestbook.thanks, "info");
      });

      renderList();
      box.append(form, list);
      void go;
      void refresh;
    },
  },

  /* ---- 搜一搜（彩蛋） ---- */
  search: {
    url: WEB.search.url,
    title: WEB.search.title,
    render(box, go) {
      stats.bump("visit.search");
      const brand = h("div", "web-search-brand");
      brand.append(h("b", "web-search-logo", WEB.search.brand), h("span", "", WEB.search.slogan));

      const input = el("input", "w98-input web-search-input") as HTMLInputElement;
      input.placeholder = WEB.search.placeholder;
      input.maxLength = 30;
      const btn = el("button", "w98-btn", WEB.search.button);
      btn.type = "button";
      const bar = h("div", "web-search-bar");
      bar.append(input, btn);

      const results = h("div", "web-search-results");

      interface Hit {
        title: string;
        url: string;
        snippet: string;
        to: string | null;
      }

      const hitEl = (r: Hit) => {
        const item = h("div", "web-hit");
        const title = r.to ? link(r.title, r.to) : h("a", "web-link", r.title);
        if (!r.to) (title as HTMLAnchorElement).href = "#";
        item.append(title, h("div", "web-hit-url", r.url), h("div", "web-hit-snippet", r.snippet));
        return item;
      };

      const run = () => {
        const q = (input.value ?? "").trim();
        if (!q) return;
        stats.once("egg.search");
        stats.bump("search.queries");
        results.innerHTML = "";
        const lower = q.toLowerCase();
        let hits: Hit[];
        if (/咕|鸡|gugu/.test(lower)) {
          hits = WEB.search.gugu;
        } else if (/彩蛋|egg|秘密|secret/.test(lower)) {
          hits = [
            {
              title: "彩蛋探测器 - 搜一搜知道",
              url: "zhidao.yes/q/彩蛋",
              snippet: WEB.search.eggDetector(stats.eggs().length),
              to: null,
            },
            ...WEB.search.defaults(q).slice(0, 2),
          ];
        } else if (/天气|weather/.test(lower)) {
          hits = WEB.search.weather;
        } else if (lower.includes("42") || /生命|宇宙|一切/.test(lower)) {
          results.appendChild(h("div", "web-hit-snippet", WEB.search.answer42));
          hits = WEB.search.defaults(q).slice(0, 2);
        } else {
          hits = WEB.search.defaults(q);
        }
        results.prepend(h("div", "web-dim", WEB.search.hits(q, 1998 + rand(8000))));
        hits.forEach((r2) => results.appendChild(hitEl(r2)));
      };

      btn.addEventListener("click", run);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") run();
      });

      box.append(brand, bar, results);
      void go;
    },
  },

  /* ---- 1998 新闻中心（彩蛋） ---- */
  news: {
    url: WEB.news.url,
    title: WEB.news.title,
    render(box) {
      stats.bump("visit.news");
      stats.once("egg.news");
      const head = h("div", "web-news-head");
      head.append(
        h("div", "web-news-masthead", WEB.news.title),
        h("div", "web-news-dateline", WEB.news.dateline),
        h("div", "web-dim", WEB.news.motto)
      );
      const paper = h("div", "web-news-paper");
      WEB.news.items.forEach((n) => {
        const item = h("div", "web-news-item");
        const titleRow = h("div", "web-news-title-row");
        titleRow.append(h("b", "", `${n.date} · ${n.title}`));
        if ((n as { fake?: boolean }).fake) titleRow.appendChild(h("i", "web-news-fake", WEB.news.fakeTag));
        item.append(titleRow, h("div", "web-news-body", n.body));
        paper.appendChild(item);
      });
      box.append(head, paper);
    },
  },
};

/* 打不开的两种页面：404 与 拨号失败 */
function renderNotFound(box: HTMLElement) {
  stats.bump("visit.404");
  stats.once("egg.404");
  const page = h("div", "web-error");
  page.append(
    h("h1", "", WEB.notFound.heading),
    ...WEB.notFound.body.map((l) => h("p", "", l)),
    h("div", "web-foot", WEB.notFound.footer)
  );
  box.appendChild(page);
}

function renderOffline(box: HTMLElement, url: string) {
  stats.bump("visit.offline");
  stats.once("egg.offline");
  const page = h("div", "web-error");
  page.append(
    h("h1", "", WEB.offline.heading),
    ...WEB.offline.body(url).map((l) => h("p", "", l)),
    h("div", "web-foot", WEB.offline.footer)
  );
  box.appendChild(page);
}

/* ============================================================ */

function build(ctx: AppCtx) {
  const { body } = ctx;
  const wrap = h("div", "ie-wrap");

  /* 工具栏 */
  const toolbar = h("div", "ie-toolbar");
  const mkNavBtn = (icon: string, label: string) => {
    const b = el("button", "ie-tb-btn");
    b.type = "button";
    b.innerHTML = TB[icon];
    b.appendChild(h("span", "", label));
    b.setAttribute("aria-label", label);
    return b;
  };
  const bBack = mkNavBtn("back", "后退");
  const bFwd = mkNavBtn("forward", "前进");
  const bStop = mkNavBtn("stop", "停止");
  const bRefresh = mkNavBtn("refresh", "刷新");
  const bHome = mkNavBtn("home", "主页");
  [bBack, bFwd, bStop, bRefresh, bHome].forEach((b) => toolbar.appendChild(b));

  /* 地址栏 */
  const addrBar = h("div", "ie-addrbar");
  const addrInput = el("input", "w98-input ie-addr") as HTMLInputElement;
  addrInput.autocomplete = "off";
  addrInput.spellcheck = false;
  addrBar.append(h("span", "ie-addr-label", "地址(D)"), addrInput);

  /* 状态栏 */
  const statusbar = h("div", "ie-statusbar");
  const status = h("span", "ie-status", WEB.statusDone);
  const zone = h("span", "ie-zone", "Internet");
  statusbar.append(status, zone);

  const content = h("div", "ie-content");

  wrap.append(toolbar, addrBar, content, statusbar);
  body.appendChild(wrap);

  /* ---------- 导航 ---------- */

  const history: string[] = [];
  let hIdx = -1;
  let connectTimer: number | undefined;

  const setStatus = (t: string) => (status.textContent = t);

  const routeInfo = (route: string): { url: string; title: string } => {
    if (route.startsWith("offline|")) {
      return { url: route.slice(8), title: WEB.offline.title };
    }
    if (route === "notfound") return { url: addrInput.value || "about:blank", title: WEB.notFound.title };
    const p = PAGES[route];
    return { url: p.url, title: p.title };
  };

  const paint = (route: string) => {
    clearTimeout(connectTimer);
    content.innerHTML = "";
    content.scrollTop = 0;
    if (route.startsWith("offline|")) {
      renderOffline(content, route.slice(8));
    } else if (route === "notfound") {
      renderNotFound(content);
    } else {
      PAGES[route].render(content, go, refresh);
    }
    const info = routeInfo(route);
    addrInput.value = info.url;
    ctx.win.setTitle(`${info.title} - ${WEB.appName}`);
    setStatus(WEB.statusDone);
    updateNavBtns();
  };

  const go = (route: string) => {
    history.splice(hIdx + 1);
    history.push(route);
    hIdx = history.length - 1;
    paint(route);
  };

  const refresh = () => {
    if (hIdx < 0) return;
    setStatus(WEB.opening(routeInfo(history[hIdx]).url));
    paint(history[hIdx]);
  };

  const updateNavBtns = () => {
    bBack.disabled = hIdx <= 0;
    bFwd.disabled = hIdx >= history.length - 1;
  };

  bBack.addEventListener("click", () => {
    if (hIdx > 0) paint(history[--hIdx]);
  });
  bFwd.addEventListener("click", () => {
    if (hIdx < history.length - 1) paint(history[++hIdx]);
  });
  bStop.addEventListener("click", () => {
    clearTimeout(connectTimer);
    setStatus("已停止");
  });
  bRefresh.addEventListener("click", refresh);
  bHome.addEventListener("click", () => go("nav"));

  /* 站内链接（事件委托） */
  content.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a.web-link") as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    const to = a.dataset.to;
    if (to) go(to);
  });
  /* 状态栏显示悬停链接的假 URL */
  content.addEventListener("pointerover", (e) => {
    const a = (e.target as HTMLElement).closest("a.web-link") as HTMLAnchorElement | null;
    if (a) setStatus(`http://${(a.textContent ?? "").length * 7 + 1998}.yes/`);
  });
  content.addEventListener("pointerout", () => setStatus(WEB.statusDone));

  /* ---------- 地址栏解析 ---------- */

  const resolve = (raw: string): string => {
    let s = raw.trim().toLowerCase();
    s = s.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
    if (!s) return "nav";
    if (/^(home|首页|导航|主页|云端导航)$/.test(s)) return "nav";
    if (/^(weathercore(\.yes)?|个人主页)$/.test(s)) return "home";
    if (/留言|guestbook/.test(s)) return "guestbook";
    if (/^(so\.yes|搜一搜|搜索|search)$/.test(s)) return "search";
    if (/^(news\.yes|新闻)$/.test(s)) return "news";
    if (s.includes("cloud1998.yes")) return "nav";
    if (s.includes("weathercore")) return "home";
    if (/\./.test(s)) return `offline|${raw.trim()}`;
    return "notfound";
  };

  const navigateInput = () => {
    const raw = addrInput.value;
    const route = resolve(raw);
    if (route.startsWith("offline|")) {
      /* 模拟拨号：56K 猫的挣扎 */
      const url = route.slice(8);
      setStatus(WEB.dialing);
      content.innerHTML = "";
      content.appendChild(h("div", "web-dialing", `${WEB.connecting(url)}\n▄ ▄ ▄ ▄ ▄ ▄ ▄`));
      clearTimeout(connectTimer);
      connectTimer = window.setTimeout(() => go(route), 1400);
    } else {
      go(route);
    }
  };

  addrInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") navigateInput();
  });

  go("nav");

  return () => {
    clearTimeout(connectTimer);
  };
}

export const ieApp: AppDef = {
  id: "ie",
  title: WEB.appName,
  icon: "globe",
  width: 660,
  height: 500,
  menus: [
    {
      label: "文件",
      items: [{ label: "关闭", action: (ctx2) => ctx2.win.close() }],
    },
    {
      label: "帮助",
      items: [
        {
          label: `关于${WEB.appName}`,
          action: () =>
            wm.msgBox(
              `关于${WEB.appName}`,
              `${WEB.appName} 4.0（云端版）\n\n支持 HTML 3.2、表格、跑马灯与背景音乐。\n不支持真实互联网——网线在 1998 年就拔了。`,
              "globe"
            ),
        },
      ],
    },
  ],
  build,
};
