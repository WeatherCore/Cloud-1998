/* 显示属性：壁纸管理（内建锁定 + 用户壁纸增删，仿 Win98 显示属性对话框） */

import type { AppCtx, AppDef } from "../core/types";
import { DISPLAY } from "../core/content";
import { el } from "../core/util";
import { wm } from "../core/wm";
import { showBalloon } from "../core/shell";
import {
  addUserWallpaper,
  applyWallpaper,
  BUILT_INS,
  currentWallpaperId,
  deleteUserWallpaper,
  listWallpapers,
  wallpaperBlob,
  type WallpaperMeta,
} from "../core/wallpapers";

export const displayApp: AppDef = {
  id: "display",
  title: "显示属性",
  icon: "computer",
  width: 330,
  height: 430,
  build({ body, win }: AppCtx) {
    let items: WallpaperMeta[] = [];
    let selected = currentWallpaperId();
    const previewURLs = new Map<string, string>();

    const wrap = el("div", "display-wrap");
    const group = el("div", "w98-group");
    group.appendChild(el("legend", "", "壁纸"));
    const list = el("div", "wp-list bevel-in");
    group.appendChild(list);

    const preview = el("div", "wp-preview bevel-in");
    const btns = el("div", "wp-btns");
    const bAdd = el("button", "w98-btn", "新增(B)...");
    const bDel = el("button", "w98-btn", "删除(D)");
    const bOk = el("button", "w98-btn", "确定");
    btns.append(bAdd, bDel, bOk);
    const note = el("p", "wp-note", DISPLAY.note);

    const file = el("input") as HTMLInputElement;
    file.type = "file";
    file.accept = "image/*";
    file.style.display = "none";

    wrap.append(group, preview, btns, note, file);
    body.appendChild(wrap);

    const showPreview = async (it: WallpaperMeta) => {
      let url: string;
      if (it.builtIn) {
        url = `${import.meta.env.BASE_URL}wallpapers/${it.id}.webp`;
      } else {
        let u = previewURLs.get(it.id);
        if (!u) {
          const blob = await wallpaperBlob(it.id).catch(() => undefined);
          if (!blob) return;
          u = URL.createObjectURL(blob);
          previewURLs.set(it.id, u);
        }
        url = u;
      }
      preview.style.backgroundImage = `url("${url}")`;
    };

    const refresh = async () => {
      try {
        items = await listWallpapers();
      } catch {
        /* IndexedDB 不可用（部分隐身模式/webview）：退回内建壁纸 */
        items = [...BUILT_INS];
      }
      list.textContent = "";
      if (!items.some((i) => i.id === selected)) selected = "bliss";
      items.forEach((it) => {
        const row = el("div", "wp-item");
        row.textContent = it.builtIn ? `${it.name}（内建）` : it.name;
        if (it.id === selected) row.classList.add("sel");
        row.addEventListener("click", () => {
          selected = it.id;
          list
            .querySelectorAll(".wp-item")
            .forEach((n) => n.classList.remove("sel"));
          row.classList.add("sel");
          void showPreview(it);
        });
        row.addEventListener("dblclick", async () => {
          await applyWallpaper(it.id);
          showBalloon(DISPLAY.applied(it.name));
        });
        list.appendChild(row);
      });
      void showPreview(items.find((i) => i.id === selected) ?? items[0]);
    };

    bAdd.addEventListener("click", () => file.click());
    file.addEventListener("change", async () => {
      const f = file.files?.[0];
      file.value = "";
      if (!f) return;
      /* 选完文件先让用户命名：预填文件名，取消则放弃上传 */
      const fallback = (
        f.name.replace(/\.[^.]+$/, "").trim() || "未命名"
      ).slice(0, 24);
      const input = await wm.promptBox(
        DISPLAY.nameTitle,
        DISPLAY.namePrompt,
        fallback
      );
      if (input === null) return;
      const r = await addUserWallpaper(f, input.trim() || fallback);
      if (!r.ok) {
        showBalloon(
          r.reason === "type"
            ? DISPLAY.badType
            : r.reason === "full"
              ? DISPLAY.full
              : DISPLAY.badImage
        );
        return;
      }
      selected = r.meta.id;
      await applyWallpaper(r.meta.id);
      await refresh();
      showBalloon(DISPLAY.added(r.meta.name));
    });

    bDel.addEventListener("click", async () => {
      const meta = items.find((i) => i.id === selected);
      if (!meta) return;
      if (meta.builtIn) {
        showBalloon(DISPLAY.locked);
        return;
      }
      const yes = await wm.confirmBox("删除壁纸", DISPLAY.confirm(meta.name));
      if (!yes) return;
      await deleteUserWallpaper(meta.id);
      if (currentWallpaperId() === meta.id) await applyWallpaper("bliss");
      selected = "bliss";
      await refresh();
      showBalloon(DISPLAY.deleted);
    });

    bOk.addEventListener("click", async () => {
      const name = items.find((i) => i.id === selected)?.name ?? "壁纸";
      await applyWallpaper(selected);
      showBalloon(DISPLAY.applied(name));
      win.close();
    });

    void refresh();

    /* 关窗时释放预览 URL */
    return () => previewURLs.forEach((u) => URL.revokeObjectURL(u));
  },
};
