/* MS-DOS 方式：可交互终端，埋了 sudo rm -rf / 蓝屏彩蛋 */

import type { AppCtx, AppDef } from "../core/types";
import { ABOUT, QUOTES, SITE, TERMINAL } from "../core/content";
import { feedGugu, guguInfoLines, releaseGugu, summonGugu } from "../core/chicken";
import { showBSOD } from "../core/fx";
import { startSaver } from "../core/screensaver";
import { el, rand, reducedMotion, sleep } from "../core/util";

const PROMPT = `C:\\Users\\${SITE.owner}>`;

function build(ctx: AppCtx) {
  const term = el("div", "term");
  const out = el("div", "term-out");
  const row = el("div", "term-input-row");
  const prompt = el("span", "term-prompt", PROMPT);
  const input = el("input", "term-input") as HTMLInputElement;
  input.autocomplete = "off";
  input.spellcheck = false;
  row.append(prompt, input);
  term.append(out, row);
  ctx.body.appendChild(term);

  const print = (text = "", cls = "") => {
    const d = el("div", `term-line${cls ? ` ${cls}` : ""}`, text);
    out.appendChild(d);
    term.scrollTop = term.scrollHeight;
  };

  TERMINAL.motd.forEach((l) => print(l));

  let busy = false;
  const history: string[] = [];
  let hIdx = -1;

  const exec = async (raw: string) => {
    const cmd = raw.trim();
    const [name, ...args] = cmd.split(/\s+/);
    const c = (name ?? "").toLowerCase();

    switch (c) {
      case "":
        return;
      case "help":
        TERMINAL.help.forEach((l) => print(l));
        return;
      case "about":
        ABOUT.lines.forEach((l) => print(l));
        print(ABOUT.note, "term-dim");
        return;
      case "ls":
      case "dir":
        TERMINAL.lsResult.forEach((l) => print(l));
        return;
      case "github":
        print("正在打开「我的电脑」...");
        ctx.open("github");
        return;
      case "snake":
        print("贪吃蛇启动。祝你破纪录。");
        ctx.open("snake");
        return;
      case "paint":
        print("画板启动。画点什么，然后按「重力」。");
        ctx.open("paint");
        return;
      case "mine":
      case "winmine":
        print(TERMINAL.mineGo);
        ctx.open("mine");
        return;
      case "calc":
        print(TERMINAL.calcGo);
        ctx.open("calc");
        return;
      case "ie":
      case "iexplore":
      case "www":
        print(TERMINAL.ieGo);
        ctx.open("ie");
        return;
      case "ach":
      case "achievements":
        print("打开成就室。看看你解锁了多少。");
        ctx.open("ach");
        return;
      case "xyzzy":
        /* 咒语要在对的地方念才灵 */
        print(TERMINAL.xyzzy);
        return;
      case "chicken": {
        /* 隐藏子命令：chicken feed 喂食 / chicken bye 放生 / chicken info 属性 */
        const sub = (args[0] ?? "").toLowerCase();
        if (sub === "feed") {
          feedGugu();
          print(TERMINAL.guguFeed);
        } else if (sub === "bye") {
          releaseGugu();
          print(TERMINAL.guguBye);
        } else if (sub === "info") {
          guguInfoLines().forEach((l) => print(l));
        } else {
          print(summonGugu());
        }
        return;
      }
      case "quote":
        print(QUOTES[rand(QUOTES.length)]);
        return;
      case "star":
      case "stars":
        if (reducedMotion()) print(TERMINAL.starsNo, "term-dim");
        else {
          print(TERMINAL.starsGo);
          startSaver(true);
        }
        return;
      case "date":
        print(new Date().toLocaleString("zh-CN", { hour12: false }));
        return;
      case "whoami":
        print(TERMINAL.whoami);
        return;
      case "clear":
      case "cls":
        out.innerHTML = "";
        return;
      case "echo":
        print(args.join(" "));
        return;
      case "exit":
        ctx.win.close();
        return;
      case "sudo": {
        const destroying = /\brm\b/.test(cmd) && /-rf/.test(cmd) && /\//.test(cmd);
        if (destroying) {
          for (const line of TERMINAL.deleting) {
            print(line, "term-warn");
            await sleep(650);
          }
          await sleep(500);
          showBSOD();
        } else {
          print(TERMINAL.forbidden);
        }
        return;
      }
      default:
        print(`'${name}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`);
    }
  };

  input.addEventListener("keydown", async (e) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      print(`${PROMPT}${v}`, "term-cmd");
      if (v.trim()) {
        history.unshift(v);
        hIdx = -1;
      }
      busy = true;
      try {
        await exec(v);
      } finally {
        busy = false;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx < history.length - 1) input.value = history[++hIdx];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx > 0) input.value = history[--hIdx];
      else {
        hIdx = -1;
        input.value = "";
      }
    }
  });

  /* 点击终端聚焦输入框（选中文本时不抢焦点） */
  term.addEventListener("click", () => {
    if (!window.getSelection()?.toString()) input.focus();
  });
  setTimeout(() => input.focus(), 60);

  return () => {
    busy = true;
  };
}

export const terminalApp: AppDef = {
  id: "terminal",
  title: "MS-DOS 方式",
  icon: "terminal",
  width: 560,
  height: 380,
  flush: true,
  build,
};
