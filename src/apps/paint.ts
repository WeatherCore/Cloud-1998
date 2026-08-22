/* 画板：画笔/橡皮/十六色 + 手写物理引擎彩蛋（把画掉下去） */

import type { AppCtx, AppDef } from "../core/types";
import { el } from "../core/util";
import { PAINT_COLORS } from "../ui/pixel";

const W = 480;
const H = 320;

function build({ body }: AppCtx) {
  const wrap = el("div", "paint-wrap");
  const tools = el("div", "paint-tools");
  const colors = el("div", "paint-colors");
  const stage = el("div", "paint-stage");
  const canvas = el("canvas") as HTMLCanvasElement;
  canvas.width = W;
  canvas.height = H;
  stage.appendChild(canvas);

  const g = canvas.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, W, H);

  let tool: "pen" | "eraser" = "pen";
  let color = "#000000";
  let size = 3;
  let physicsOn = false;
  let raf = 0;

  /* ---------- 工具栏 ---------- */
  const mkTool = (label: string, on: boolean, fn: () => void) => {
    const b = el("button", `w98-btn small${on ? " tool-on" : ""}`, label);
    b.type = "button";
    b.addEventListener("click", fn);
    tools.appendChild(b);
    return b;
  };

  const penBtn = mkTool("画笔", true, () => {
    tool = "pen";
    penBtn.classList.add("tool-on");
    eraserBtn.classList.remove("tool-on");
  });
  const eraserBtn = mkTool("橡皮", false, () => {
    tool = "eraser";
    eraserBtn.classList.add("tool-on");
    penBtn.classList.remove("tool-on");
  });

  const sizeBtns = [1, 3, 8].map((s, i) => {
    const label = ["细", "中", "粗"][i];
    const b = el("button", `w98-btn small${s === 3 ? " tool-on" : ""}`, label);
    b.type = "button";
    b.addEventListener("click", () => {
      size = s;
      sizeBtns.forEach((x) => x.classList.remove("tool-on"));
      b.classList.add("tool-on");
    });
    tools.appendChild(b);
    return b;
  });

  const clearBtn = mkTool("清空", false, () => {
    stopPhysics();
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, H);
  });
  clearBtn.classList.remove("tool-on");

  mkTool("保存", false, () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "weathercore-画板.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
  });

  const gravityBtn = el("button", "w98-btn small gravity-btn", "重力");
  gravityBtn.type = "button";
  gravityBtn.addEventListener("click", () => {
    if (physicsOn) {
      stopPhysics();
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
    } else {
      runGravity();
    }
  });
  tools.appendChild(gravityBtn);

  /* ---------- 色板 ---------- */
  PAINT_COLORS.forEach((c, i) => {
    const sw = el("div", `paint-swatch${i === 0 ? " selected" : ""}`);
    sw.style.background = c;
    sw.addEventListener("click", () => {
      color = c;
      tool = "pen";
      penBtn.classList.add("tool-on");
      eraserBtn.classList.remove("tool-on");
      colors.querySelectorAll(".selected").forEach((n) => n.classList.remove("selected"));
      sw.classList.add("selected");
    });
    colors.appendChild(sw);
  });

  wrap.append(tools, colors, stage);
  body.appendChild(wrap);

  /* ---------- 绘制 ---------- */
  const pos = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  let drawing = false;
  let last: { x: number; y: number } | null = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (physicsOn) return;
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const p = pos(e);
    stroke(p, p);
    last = p;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing || physicsOn) return;
    const p = pos(e);
    stroke(last ?? p, p);
    last = p;
  });
  const end = () => {
    drawing = false;
    last = null;
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    g.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    g.lineWidth = tool === "eraser" ? size + 8 : size;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();
  }

  /* ---------- 物理彩蛋：画面碎成像素雨落地 ---------- */

  function runGravity() {
    const img = g.getImageData(0, 0, W, H);
    const data = img.data;
    const stride = 3;
    const parts: {
      x: number; y: number; vx: number; vy: number; c: string; asleep: boolean;
    }[] = [];
    for (let y = 0; y < H; y += stride) {
      for (let x = 0; x < W; x += stride) {
        const i = (y * W + x) * 4;
        const r = data[i];
        const gg = data[i + 1];
        const b = data[i + 2];
        /* 白底不参与坠落 */
        if (r > 235 && gg > 235 && b > 235) continue;
        parts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2.4,
          vy: -Math.random() * 4.5,
          c: `rgb(${r},${gg},${b})`,
          asleep: false,
        });
      }
    }
    if (!parts.length) return;
    /* 数量上限保护（抽样丢弃） */
    while (parts.length > 3800) parts.splice((Math.random() * parts.length) | 0, 1);

    physicsOn = true;
    gravityBtn.textContent = "复位";

    const t0 = performance.now();
    const tick = (t: number) => {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      let awake = 0;
      for (const p of parts) {
        if (!p.asleep) {
          p.vy += 0.5;
          p.x += p.vx;
          p.y += p.vy;
          const floor = H - stride;
          if (p.y >= floor) {
            p.y = floor;
            p.vy *= -0.55;
            p.vx *= 0.985;
            if (Math.abs(p.vy) < 0.9) {
              p.vy = 0;
              if (Math.abs(p.vx) < 0.15) p.asleep = true;
            }
          }
          awake++;
        }
        g.fillStyle = p.c;
        g.fillRect(p.x, p.y, stride, stride);
      }
      if (awake > 0 && t - t0 < 12000) {
        raf = requestAnimationFrame(tick);
      } else {
        physicsOn = false;
        gravityBtn.textContent = "重力";
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function stopPhysics() {
    cancelAnimationFrame(raf);
    physicsOn = false;
    gravityBtn.textContent = "重力";
  }

  return () => cancelAnimationFrame(raf);
}

export const paintApp: AppDef = {
  id: "paint",
  title: "画板",
  icon: "paint",
  width: 520,
  height: 460,
  build,
};
