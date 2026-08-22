/* ============================================================
   全站文案中枢：想改网站上的任何一句话，只改这个文件。
   ============================================================ */

export const SITE = {
  /* 系统用户名（出现在登录欢迎、关于本机、各处署名） */
  owner: "WeatherCore",

  /* GitHub（我的电脑窗口会实时拉取这个账号的公开数据） */
  githubUser: "WeatherCore",
  githubUrl: "https://github.com/WeatherCore",

  /* 开机问候（进入桌面右下角弹出的欢迎气泡） */
  welcome: "欢迎回来，WeatherCore\n今天也想写点好玩的代码",

  /* 系统名称 */
  osName: "云端1998",
};

/* 关于我：占位文案，直接替换成你的故事 */
export const ABOUT = {
  lines: [
    "一名大学生，正在用代码认识这个世界",
    "这里是我的个人电脑，也是我的个人网站",
    "桌面上每个图标都可以双击打开，角落里埋了一些彩蛋，慢慢找",
  ],
  note: "（这一栏等着你来写：打开 src/content.ts，把「关于我」换成你的故事）",
  facts: [
    ["身份", "在校学生"],
    ["方向", "探索中"],
    ["坐标", "中国"],
    ["状态", "正在加载未来"],
  ] as [string, string][],
};

/* 励志签名（签名.txt 与屏幕保护滚动字幕共用） */
export const QUOTES: string[] = [
  "种一棵树最好的时间是十年前，其次是现在",
  "星光不问赶路人，时光不负有心人",
  "Talk is cheap. Show me the code",
  "慢慢来，比较快",
  "每一个大牛，都曾是按下 F5 的新手",
  "不要重复造轮子，除非你想学会造轮子",
  "人生没有 Ctrl+Z，但每天都有 Ctrl+N",
  "千里之行，始于 Hello World",
  "失败乃成功之母，重试乃程序员之父",
  "你写下的每一行代码，都会在未来某个时刻回应你",
  "别怕慢，就怕站",
  "所有命运赠送的礼物，都在 debug 中标注了价格",
  "明天的你，会感谢今天没有放弃的自己",
  "世界上有 10 种人：懂二进制的，和不懂的",
  "熬夜解决不了 Bug，但睡眠可以让你第二天解决它",
  "行百里者半九十，行九十九者差一个分号",
  "保持饥饿，保持愚蠢",
  "代码如诗，Bug 如狗，改完还有",
  "预测未来的最好方式，就是亲手把它写出来",
  "如果一次没成功，就再 print 一遍",
];

/* 开机 BIOS 刷屏文案（英文是年代还原，中文是这台电脑的私货） */
export const BOOT_LINES: string[] = [
  "Award Modular BIOS v4.51PG, An Energy Star Ally",
  "Copyright (C) 1984-98, WeatherCore Inc.",
  "",
  "Main Processor : Pentium(R) II 350MHz",
  "Memory Test : {MEM}K OK",
  "",
  "Detecting IDE Primary Master ... WDC AC24300L",
  "Detecting IDE Primary Slave  ... None",
  "Detecting IDE Secondary Master ... CD-ROM 40X",
  "Detecting Mouse ............. Microsoft MousePort",
  "Detecting Keyboard .......... OK",
  "Detecting Dreams ............ Found 1",
  "Detecting Motivation ........ 100%",
  "",
  "Loading CLOUD 1998 ...",
];

/* 启动画面副标题 */
export const SPLASH_SUB = "第四版 · 千禧年倒计时 489 天";

/* 终端帮助与文案 */
export const TERMINAL = {
  motd: [
    "云端1998 DOS [版本 4.10.1998]",
    "(C)Copyright 1998 WeatherCore Inc. 保留所有权利。",
    "",
    "输入 help 查看可用命令。",
  ],
  help: [
    "可用命令：",
    "  help      显示本帮助",
    "  about     关于这台电脑的主人",
    "  ls        列出 C:\\ 目录",
    "  github    打开「我的电脑」查看 GitHub 数据",
    "  snake     打开贪吃蛇",
    "  paint     打开画板",
    "  quote     抽一句今日签名",
    "  date      显示当前日期时间",
    "  whoami    我是谁",
    "  clear     清屏",
    "  exit      关闭终端",
    "",
    "还有一些命令没写在这里。探索是程序员的天性。",
  ],
  lsResult: [
    " C:\\ 的目录",
    "ABOUT     <DIR>     关于我",
    "DOCS      <DIR>     我的项目",
    "GITHUB    <DIR>     我的数据",
    "QUOTES    TXT     20 条励志签名",
    "SECRETS   <DIR>     你猜",
    "TODO      TXT     永远在更新",
  ],
  whoami: "WEATHERCORE\\WeatherCore 一名普通又闪闪发光的大学生",
  starsGo: "星空引擎点火。动一下鼠标或敲个键就能回来。",
  starsNo: "检测到「减少动态效果」：星空引擎尊重这个设置，保持熄火。",
  guguFeed: "撒下一把谷粒。云咕咕已经在盯着了。",
  guguBye: "云咕咕朝屏幕边缘走去。输入 chicken 召回它。",
  forbidden: "权限不足：只有主任程序员才能这么做。（提示：试试 sudo rm -rf /）",
  deleting: [
    "正在删除 C:\\Windows ...",
    "正在删除 C:\\Program Files ...",
    "正在删除 C:\\回忆 ...",
    "正在删除 C:\\未来 ... 失败：拒绝删除",
    "致命错误：无法删除的东西，比能删除的更多。",
  ],
};

/* 回收站里的内容 */
export const RECYCLE = {
  file: "前任代码.cpp",
  size: "4.2 MB",
  deletedAt: "2024-06-01 03:17",
  code: [
    "#include <iostream>",
    "using namespace std;",
    "",
    "// 这段代码陪我挂过科、熬过夜，现予厚葬",
    "int main() {",
    "    while (true) {",
    '        cout << "我会成功的" << endl;',
    "        // TODO: 怎么退出来着",
    "    }",
    "    return 0;  // 永远到不了这里，就像当年的复习计划",
    "}",
  ],
  emptied: "回收站已清空。往事随风，代码永恒。",
  confirmEmpty: "确定要永久删除「前任代码.cpp」吗？",
};

/* 显示属性（壁纸管理） */
export const DISPLAY = {
  note: "内建壁纸不可删除。自定义壁纸只保存在这台浏览器里，清除浏览器数据会一起消失。",
  locked: "系统壁纸不可删除。",
  full: "壁纸抽屉满了：最多 8 张自定义壁纸，先删几张再添。",
  badType: "这不是图片文件。请选 jpg / png / webp 等图片。",
  badImage: "这张图打不开，换一张试试。",
  nameTitle: "壁纸命名",
  namePrompt: "给新壁纸起个好认的名字（最多 24 字）：",
  added: (n: string) => `已添加「${n}」，并设为当前壁纸。`,
  deleted: "壁纸已删除，桌面回到草原。",
  confirm: (n: string) => `确定要删除壁纸「${n}」吗？`,
  applied: (n: string) => `壁纸已更换：${n}。`,
};

/* 消息对话框文案 */
export const DIALOGS = {
  konami: "科乐美秘籍确认\nWeatherCore，你果然是老玩家！！！\n那奖励你一场像素雨",
  notepadSave: "无法保存：励志签名受系统保护。\n（好签名值得背下来，而不是存档）",
  notepadAbout: "本程序的存在是为了告诉你：慢一点也没关系",
  systemAbout:
    "云端1998（Cloud 1998）\n第四版 · 个人电脑\n\n本系统由 WeatherCore 打造\n所有像素均为手工绘制\n所有数据来自 GitHub 实时接口",
  wallpaper: "壁纸已更换\n窗外有草原，也有湖光",
  refresh: "刷新完成\n桌面的一切都还在，放心",
  snakeOver: (score: number, best: number) =>
    score >= best && score > 0
      ? `新纪录！本局 ${score} 分。\n这条蛇记住了你的名字。`
      : `本局 ${score} 分，最佳 ${best} 分。\n再 来 一 局。`,
};

/* 云咕咕：桌面宠物鸡（src/core/chicken.ts） */
export const GUGU = {
  name: "云咕咕",
  feed: "喂食",
  mute: "静音",
  unmute: "取消静音",
  bye: "再见",
  props: "属性",
  hatch: "孵蛋",
  eggTitle: "云咕咕的蛋",
  breed: "白鸡（星露谷血统）",
  eggStats: (n: number, m: number) => `已收集 ${n} 颗 · 孵出 ${m} 只`,
  metToday: "首次相遇：今天",
  metDays: (d: number) => `首次相遇至今 ${d} 天`,
  moods: {
    kicked: "被踢了一脚，有点委屈",
    laid: "刚下了颗蛋，很有成就感",
    hatched: "孩子刚破壳，寸步不离地盯着",
    fed: "刚吃饱，嗉子鼓鼓的",
    woken: "睡醒了，神清气爽",
    broody: "带着孩子，母爱泛滥",
    idle: "悠闲啄米中",
  },
  firstChick: "破壳了！云咕咕当妈妈了",
  secondChick: "第二只小鸡破壳了。家里三只鸡，热闹",
  termHere: "云咕咕正在桌面上溜达。它听见了，咕了一声",
  termRecall: "广播发出：咕——咕——咕。云咕咕从屏幕外跑了回来啦",
  releaseHint: "云咕咕走出屏幕了！！！\n想它的时候，在「MS-DOS 方式」输入 chicken 召回",
  egg10: "第 10 颗蛋！云咕咕回头看了一眼，非常满意。蛋数已计入系统档案",
  eggMore: (n: number) => `第 ${n} 颗蛋。这只鸡的产能已经引起系统的注意了`,
};

/* BSOD 蓝屏文案（触发方式：终端输入 sudo rm -rf /） */
export const BSOD_TEXT = [
  "发生了一个致命异常 0E 在 0028:C0011E36，",
  "位于 VXD WEATHERCORE(01) + 00010E36。",
  "当前应用程序将被终止。",
  "",
  "*  按任意键终止当前应用程序。",
  "*  按 CTRL+ALT+DEL 重新启动计算机。操作时",
  "   所有未保存的信息都将丢失。",
  "",
  "但是说真的，谁会真的去删除自己的回忆呢。",
];

/* ============================================================
   我的文档：作品集数据（想加项目就往 PROJECTS 里加一条）
   name   仓库名（也是实时数据的查询键）
   desc   列表里的一句话介绍
   detail 详情窗口的两三句介绍
   tags   技术栈标签
   icon   像素占位图（可选值见 ui/pixel.ts，如 logo/terminal/train/text/about/help）
   ============================================================ */

export interface Project {
  name: string;
  desc: string;
  detail: string;
  tags: string[];
  icon: string;
}

export const PROJECTS: Project[] = [
  {
    name: "Gewu-Deep-Research",
    desc: "输入一个研究问题，自动产出带引用的研究报告",
    detail:
      "基于 LangGraph 的多 Agent 深度研究系统：Supervisor 负责拆解调度，多个研究员子图并行搜索，Token 超限自动降级重试。从需求澄清到带引用的 Markdown 报告，全流程自动完成。",
    tags: ["LangGraph", "多 Agent", "Python"],
    icon: "logo",
  },
  {
    name: "Tech-Finds-Deep-Dive",
    desc: "深度读懂技术项目，产出可直接发布的小红书种草文案",
    detail:
      "工程化的 AI skill：四维卖点硬约束、违禁词自检-改写-复检闭环、4 种人设按品类自动匹配、8 个爆文模板。数字卖点必须有出处，禁止编造。",
    tags: ["AI Skill", "文案工程化", "Python"],
    icon: "text",
  },
  {
    name: "Code-Probe",
    desc: "把 Python 代码库变成可对话的知识库，答案自带文件路径和行号",
    detail:
      "全栈 RAG 系统：字符级按行边界分块防语义断裂、SSE 四阶段流式调用、Embedding 与 LLM 配置回退、后台索引状态轮询，RAG 全流程前端可见。",
    tags: ["RAG", "全栈", "FastAPI"],
    icon: "terminal",
  },
  {
    name: "IronTicket-12306",
    desc: "面向高并发场景的 12306 购票系统",
    detail:
      "以 12306 购票为原型的高并发实战项目，把秒杀、超卖、库存扣减这些经典并发问题完整走了一遍。",
    tags: ["高并发", "实战项目"],
    icon: "train",
  },
  {
    name: "Code-Explain-Expert",
    desc: "严格零污染地解读大型项目源码，生成导航文档和意图级注释",
    detail:
      "写入前确认护栏 + 骨架提取 + 宏观导航 + 精准注释的五阶段流水线，所有注释非破坏性追加，git 严格只读。适合接手、复盘、交接与审计。",
    tags: ["AI Skill", "代码解读", "Python"],
    icon: "about",
  },
  {
    name: "408",
    desc: "考研 408 四科良师型答疑：讲完知识点立刻出题检验",
    detail:
      "数据结构、计组、操作系统、网络四科答疑 skill：三信号分层自适应难度、跨会话画像持久化、跨科术语去歧义索引。适合全阶段备考与查漏补缺。",
    tags: ["考研 408", "AI Skill", "Node.js"],
    icon: "help",
  },
];

/* 关机画面 */
export const SHUTDOWN_TEXT = "现在可以安全地关闭计算机了";
export const SHUTDOWN_HINT = "（点击屏幕重新开机）";
