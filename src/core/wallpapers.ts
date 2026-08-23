/* ============================================================
   壁纸仓库：内建壁纸锁定不可删，用户壁纸压缩后存 IndexedDB
   （localStorage 只有 5MB，放照片两三张就爆，故用 IndexedDB）
   ============================================================ */

import { stats } from "./stats";
import { $, store } from "./util";

export interface WallpaperMeta {
  id: string;
  name: string;
  builtIn: boolean;
}

interface UserRecord {
  id: string;
  name: string;
  blob: Blob;
  added: number;
}

export const BUILT_INS: WallpaperMeta[] = [
  { id: "bliss", name: "草原", builtIn: true },
  { id: "lake", name: "湖光", builtIn: true },
];

const DB_NAME = "wc98-wallpapers";
const STORE = "items";
const STORE_KEY = "wc98-wallpaper";
export const MAX_USER = 8;
const MAX_EDGE = 1920;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    /* 无论成功失败都要关连接，避免请求/事务错误路径泄漏连接 */
    const close = () => db.close();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      close();
      reject(req.error);
    };
    t.oncomplete = close;
    t.onabort = close;
    t.onerror = close;
  });
}

export async function listWallpapers(): Promise<WallpaperMeta[]> {
  const rows = await tx<UserRecord[]>("readonly", (s) => s.getAll());
  const user = rows
    .sort((a, b) => a.added - b.added)
    .map((r) => ({ id: r.id, name: r.name, builtIn: false }));
  return [...BUILT_INS, ...user];
}

/** 压缩：最长边 1920、WebP q0.8（编码失败回退 JPEG），避免撑爆配额 */
async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode"));
      i.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(img.width * scale));
    cv.height = Math.max(1, Math.round(img.height * scale));
    cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
    const webp = await new Promise<Blob | null>((r) =>
      cv.toBlob(r, "image/webp", 0.8)
    );
    if (webp) return webp;
    return (
      (await new Promise<Blob | null>((r) =>
        cv.toBlob(r, "image/jpeg", 0.8)
      )) ?? file
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type AddResult =
  | { ok: true; meta: WallpaperMeta }
  | { ok: false; reason: "type" | "full" | "bad" };

export async function addUserWallpaper(
  file: File,
  name?: string
): Promise<AddResult> {
  if (!file.type.startsWith("image/")) return { ok: false, reason: "type" };
  const rows = await tx<UserRecord[]>("readonly", (s) => s.getAll());
  if (rows.length >= MAX_USER) return { ok: false, reason: "full" };
  let blob: Blob;
  try {
    blob = await shrink(file);
  } catch {
    return { ok: false, reason: "bad" };
  }
  const label = (
    (name ?? file.name.replace(/\.[^.]+$/, "")).trim() || "未命名"
  ).slice(0, 24);
  const rec: UserRecord = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: label,
    blob,
    added: Date.now(),
  };
  await tx("readwrite", (s) => s.put(rec));
  return { ok: true, meta: { id: rec.id, name: label, builtIn: false } };
}

export async function deleteUserWallpaper(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

async function userBlob(id: string): Promise<Blob | undefined> {
  const rec = await tx<UserRecord | undefined>("readonly", (s) => s.get(id));
  return rec?.blob;
}

/** 取壁纸内容（预览用）；内建返回 null，走 /wallpapers/ 静态文件 */
export async function wallpaperBlob(
  id: string
): Promise<Blob | null | undefined> {
  if (BUILT_INS.some((b) => b.id === id)) return null;
  return userBlob(id);
}

/* ---------- 应用到桌面 ---------- */

let liveURL: string | null = null;

export function currentWallpaperId(): string {
  return store.get(STORE_KEY) ?? "bliss";
}

/** 应用壁纸；用户壁纸记录丢失时自动回退草原。返回实际生效的 id。 */
export async function applyWallpaper(id: string): Promise<string> {
  const desktop = $("#desktop");
  desktop.style.backgroundImage = "";
  document.body.classList.remove("wp-bliss", "wp-lake");
  if (BUILT_INS.some((b) => b.id === id)) {
    document.body.classList.add(`wp-${id}`);
    /* 内建壁纸背景也走 BASE_URL，避免 CSS 硬编码绝对路径导致子路径部署 404 */
    desktop.style.backgroundImage = `url("${import.meta.env.BASE_URL}wallpapers/${id}.webp")`;
    store.set(STORE_KEY, id);
    if (!restoring) stats.once("wallpaper.set");
    return id;
  }
  const blob = await userBlob(id).catch(() => undefined);
  if (!blob) return applyWallpaper("bliss");
  if (liveURL) URL.revokeObjectURL(liveURL);
  liveURL = URL.createObjectURL(blob);
  desktop.style.backgroundImage = `url("${liveURL}")`;
  store.set(STORE_KEY, id);
  if (!restoring) stats.once("wallpaper.set");
  return id;
}

/* 开机恢复壁纸不算「换壁纸」：只有用户亲手换的才记成就 */
let restoring = false;

export function restoreWallpaper() {
  restoring = true;
  applyWallpaper(currentWallpaperId())
    .catch(() => applyWallpaper("bliss"))
    .finally(() => (restoring = false));
}
