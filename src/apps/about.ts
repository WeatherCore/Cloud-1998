/* 关于我 */

import type { AppCtx, AppDef } from "../core/types";
import { ABOUT, SITE } from "../core/content";
import { el } from "../core/util";
import { iconURL } from "../ui/pixel";

function build({ body }: AppCtx) {
  const wrap = el("div", "about-wrap");

  const head = el("div", "about-head");
  const av = el("div", "about-avatar");
  const img = el("img") as HTMLImageElement;
  img.src = `https://github.com/${SITE.githubUser}.png`;
  img.alt = SITE.owner;
  img.width = 64;
  img.height = 64;
  img.addEventListener("error", () => {
    img.src = iconURL("logo");
    img.style.width = "64px";
    img.style.height = "64px";
  });
  av.appendChild(img);
  const headText = el("div");
  headText.innerHTML = `<div class="about-name">${SITE.owner}</div>
    <div class="about-tag">个人电脑 · 主人</div>`;
  head.append(av, headText);

  const bio = el("div", "about-bio");
  ABOUT.lines.forEach((t) => bio.appendChild(el("p", "", t)));
  const note = el("p", "about-note", ABOUT.note);
  bio.appendChild(note);

  const group = el("div", "w98-group");
  group.appendChild(el("legend", "", "基本情况"));
  const facts = el("div", "about-facts");
  ABOUT.facts.forEach(([k, v]) => {
    facts.appendChild(el("div", "k", k));
    facts.appendChild(el("div", "v", v));
  });
  group.appendChild(facts);

  const row = el("div", "btn-row");
  const btn = el("button", "w98-btn", "访问 GitHub");
  btn.addEventListener("click", () =>
    window.open(SITE.githubUrl, "_blank", "noopener")
  );
  row.appendChild(btn);

  wrap.append(head, bio, group, row);
  body.appendChild(wrap);
}

export const aboutApp: AppDef = {
  id: "about",
  title: "关于我",
  icon: "about",
  width: 430,
  height: 440,
  build,
};
