/* 开机序列：BIOS 自检刷屏（含内存计数）→ 启动画面 → 桌面 */

import { iconURL } from "../ui/pixel";
import { BOOT_LINES, SITE, SPLASH_SUB } from "./content";
import { el, rand, reducedMotion, sleep } from "./util";

export function runBoot(onDone: () => void) {
  /* 回访或系统开启减少动态：快进 */
  const fast = localStorage.getItem("wc98-booted") === "1" || reducedMotion();

  const boot = el("div");
  boot.id = "boot";
  const splash = el("div");
  splash.id = "boot-splash";
  splash.innerHTML = `
    <img class="splash-logo" src="${iconURL("logo")}" alt="" width="96" height="96">
    <div class="splash-title">${SITE.osName}<small>${SPLASH_SUB}</small></div>
    <div class="splash-bar"><i></i></div>`;
  const skip = el("div");
  skip.id = "boot-skip";
  skip.textContent = "点击任意处跳过";
  document.body.append(boot, splash, skip);

  let skipped = fast;
  const skipNow = () => (skipped = true);
  document.addEventListener("pointerdown", skipNow);
  document.addEventListener("keydown", skipNow);

  const line = (text: string) => {
    boot.appendChild(document.createTextNode(text + "\n"));
  };

  const memCount = async () => {
    const span = document.createElement("span");
    boot.appendChild(span);
    for (let m = 0; m <= 65536; m += 2048) {
      if (skipped) break;
      span.textContent = `Memory Test : ${m}K`;
      await sleep(fast ? 6 : 22);
    }
    span.textContent = "Memory Test : 65536K OK";
    boot.appendChild(document.createTextNode("\n"));
  };

  (async () => {
    for (const text of BOOT_LINES) {
      if (skipped) break;
      if (text.includes("{MEM}")) {
        await memCount();
        continue;
      }
      line(text);
      await sleep(fast ? 20 : 90 + rand(130));
    }
    if (!fast) line("");

    boot.style.display = "none";
    splash.classList.add("show");
    await sleep(skipped ? 300 : 2400);

    localStorage.setItem("wc98-booted", "1");
    document.removeEventListener("pointerdown", skipNow);
    document.removeEventListener("keydown", skipNow);
    boot.remove();
    splash.remove();
    skip.remove();
    onDone();
  })();
}
