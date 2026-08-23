/* 程序注册表：桌面与开始菜单都从这里取 */

import type { AppDef } from "../core/types";
import { aboutApp } from "./about";
import { githubApp } from "./github";
import { paintApp } from "./paint";
import { snakeApp } from "./snake";
import { mineApp } from "./mine";
import { calcApp } from "./calc";
import { ieApp } from "./ie";
import { terminalApp } from "./terminal";
import { notepadApp } from "./notepad";
import { achApp } from "./ach";
import { binApp, binFileApp } from "./bin";
import { displayApp } from "./display";
import { docsApp, projectApp } from "./docs";

export const APPS: AppDef[] = [
  githubApp,
  aboutApp,
  docsApp,
  ieApp,
  paintApp,
  snakeApp,
  mineApp,
  calcApp,
  terminalApp,
  notepadApp,
  achApp,
  binApp,
  binFileApp,
  displayApp,
  projectApp,
];

/** 桌面与开始菜单显示的顺序（binfile/project 是详情窗口，不上桌面） */
export const DESKTOP_ICONS = [
  "github",
  "about",
  "docs",
  "ie",
  "paint",
  "snake",
  "mine",
  "calc",
  "terminal",
  "notepad",
  "ach",
  "bin",
];

export const getApp = (id: string) => APPS.find((a) => a.id === id);
