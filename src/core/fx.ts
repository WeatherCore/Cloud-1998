/* 全屏特效：蓝屏 / 关机画面 / 像素雨 */

import { BSOD_TEXT, SHUTDOWN_HINT, SHUTDOWN_TEXT } from "./content";
import { stats } from "./stats";
import { el, reducedMotion, store } from "./util";
import { wm } from "./wm";

/** 蓝屏。任意键或点击后执行一次完整的重新开机 */
export function showBSOD() {
  stats.once("egg.bsod");
  document.getElementById("bsod")?.remove();
  const b = el("div");
  b.id = "bsod";
  b.classList.add("show");
  b.textContent = "\n\n\n" + BSOD_TEXT.join("\n");
  document.body.appendChild(b);

  const dismiss = () => {
    store.remove("wc98-booted");
    location.reload();
  };
  /* 延迟绑定，避免触发蓝屏的那次按键顺手把它关掉 */
  setTimeout(() => {
    b.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss, { once: true });
  }, 600);
}

/** 关机画面。点击重新开机 */
export function showShutdown() {
  wm.closeAll();
  document.getElementById("start-menu")?.classList.remove("open");
  const s = el("div");
  s.id = "shutdown";
  s.classList.add("show");
  s.innerHTML = `<div><div class="sd-text">${SHUTDOWN_TEXT}</div><div class="sd-hint">${SHUTDOWN_HINT}</div></div>`;
  document.body.appendChild(s);
  setTimeout(() => {
    s.addEventListener("pointerdown", () => {
      store.remove("wc98-booted");
      location.reload();
    });
  }, 500);
}

/** 像素雨（科乐美秘籍奖励） */
export function confetti(durationMs = 3800) {
  if (reducedMotion()) return;
  document.getElementById("confetti")?.remove();
  const layer = el("div");
  layer.id = "confetti";
  layer.classList.add("show");
  const canvas = el("canvas");
  layer.appendChild(canvas);
  document.body.appendChild(layer);

  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = (innerWidth * dpr) | 0;
  canvas.height = (innerHeight * dpr) | 0;
  const g = canvas.getContext("2d")!;
  g.scale(dpr, dpr);

  const colors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffffff"];
  const parts = Array.from({ length: 160 }, () => ({
    x: Math.random() * innerWidth,
    y: -Math.random() * innerHeight,
    s: 3 + Math.random() * 5,
    vy: 2 + Math.random() * 3.5,
    vx: (Math.random() - 0.5) * 1.2,
    c: colors[(Math.random() * colors.length) | 0],
  }));

  const t0 = performance.now();
  const tick = (t: number) => {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > innerHeight + 10) p.y = -10;
      g.fillStyle = p.c;
      g.fillRect(p.x, p.y, p.s, p.s);
    }
    if (t - t0 < durationMs) requestAnimationFrame(tick);
    else layer.remove();
  };
  requestAnimationFrame(tick);
}
