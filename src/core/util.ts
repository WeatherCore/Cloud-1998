/* 小工具集 */

export function $<T extends HTMLElement = HTMLElement>(
  sel: string,
  root: ParentNode = document
): T {
  return root.querySelector(sel) as T;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export const isMobile = () =>
  matchMedia("(pointer: coarse)").matches || innerWidth < 700;

export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/* localStorage 安全包装：禁用站点数据的浏览器里读写会抛
   SecurityError，一律静默降级（读为 null，写丢弃），不能让整站白屏 */
export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* 存不进去就算了 */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* 同上 */
    }
  },
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/** 0..n-1 随机整数 */
export const rand = (n: number) => Math.floor(Math.random() * n);
