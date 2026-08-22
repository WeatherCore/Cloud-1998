import type { WinHandle } from "./wm";

export interface MenuItem {
  label?: string;
  sep?: boolean;
  disabled?: boolean;
  action?: (ctx: AppCtx) => void;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

/** 每个桌面程序的定义 */
export interface AppDef {
  id: string;
  title: string;
  /** 像素图标名（见 ui/pixel.ts） */
  icon: string;
  width: number;
  height: number;
  /** 内容区不留白（终端/游戏等满铺场景） */
  flush?: boolean;
  /** 窗口菜单栏（文件/编辑等） */
  menus?: MenuGroup[];
  /** 构建内容；返回的函数在窗口关闭时调用（清理定时器等） */
  build(ctx: AppCtx): void | (() => void);
}

export interface AppCtx {
  body: HTMLElement;
  win: WinHandle;
  /** 打开另一个程序（如终端里输 github 命令） */
  open(appId: string): void;
}
