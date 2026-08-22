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

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/** 0..n-1 随机整数 */
export const rand = (n: number) => Math.floor(Math.random() * n);
