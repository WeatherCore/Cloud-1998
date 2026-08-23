/* ============================================================
   统计与成就地基
   所有程序把值得纪念的事记到这里（localStorage 计数器），
   后续的成就系统只读这里，不用回头改各个程序。
   key 约定：普通计数任意取名；彩蛋发现统一用 egg.* 前缀，
   这样成就系统可以一键枚举「已发现的彩蛋」。
   ============================================================ */

import { store } from "./util";

const KEY = "wc98-stats";

/* 成就系统首航清零：第一次带着成就系统上线时，把历史计数与已解锁
   记录一并清空，让所有人（包括浏览器里已有旧数据的老朋友）从 0 开跑，
   不会一上线就被缓存里的旧战绩触发弹窗。只执行一次；
   fresh-2：正式上架前应作者要求再清一次，配合成就页的「重置」按钮
   随时手动清零调试。今后成就扩容不再清零，由 achievements.ts 的
   补发机制衔接。 */
const FRESH_KEY = "wc98-stats-fresh-2";
if (!store.get(FRESH_KEY)) {
  store.set(FRESH_KEY, "1");
  store.remove(KEY);
  store.remove("wc98-ach");
}

type Listener = (key: string, value: number) => void;

function load(): Record<string, number> {
  try {
    return JSON.parse(store.get(KEY) ?? "{}");
  } catch {
    return {};
  }
}

let data = load();
const listeners: Listener[] = [];

function save() {
  store.set(KEY, JSON.stringify(data));
}

export const stats = {
  /** 计数 +n（默认 +1），返回新值 */
  bump(key: string, n = 1): number {
    data[key] = (data[key] ?? 0) + n;
    save();
    const v = data[key];
    listeners.forEach((fn) => fn(key, v));
    return v;
  },

  /** 只在第一次生效：已记过就返回 false。彩蛋发现用它 */
  once(key: string): boolean {
    if (data[key]) return false;
    this.bump(key);
    return true;
  },

  get(key: string): number {
    return data[key] ?? 0;
  },

  /** 成就系统（未来）从这里订阅计数变化 */
  onChange(fn: Listener) {
    listeners.push(fn);
  },

  /** 已发现的所有彩蛋 key（egg.* 前缀） */
  eggs(): string[] {
    return Object.keys(data).filter((k) => k.startsWith("egg."));
  },

  /** 调试用：清空全部计数。成就重置必须连带清这里，
      否则旧计数会在下一次 bump 时把成就全部补发回来 */
  reset(): void {
    data = {};
    save();
  },
};
