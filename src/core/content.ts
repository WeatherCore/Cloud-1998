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
    "  mine      打开扫雷",
    "  calc      打开计算器",
    "  ie        打开我的浏览器",
    "  ach       打开成就",
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
    "CALC      EXE       计算器",
    "DOCS      <DIR>     我的项目",
    "GITHUB    <DIR>     我的数据",
    "IEXPLORE  EXE       我的浏览器",
    "MINE      EXE       扫雷",
    "QUOTES    TXT     20 条励志签名",
    "SECRETS   <DIR>     你猜",
    "TODO      TXT     永远在更新",
  ],
  whoami: "WEATHERCORE\\WeatherCore 一名普通又闪闪发光的大学生",
  starsGo: "星空引擎点火。动一下鼠标或敲个键就能回来。",
  starsNo: "检测到「减少动态效果」：星空引擎尊重这个设置，保持熄火。",
  guguFeed: "撒下一把谷粒。云咕咕已经在盯着了。",
  guguBye: "云咕咕朝屏幕边缘走去。输入 chicken 召回它。",
  mineGo: "扫雷启动。祝手脚利索。",
  calcGo: "计算器启动。数字很老实，逗号不老实。",
  ieGo: "正在拨号连接 163 ... 猫已就绪。\n（其实这台电脑根本没插电话线，但你别拆穿）",
  xyzzy: "什么也没有发生。\n（有些咒语，要在对的地方念才灵。）",
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

/* ============================================================
   成就系统：全部成就定义（引擎在 core/achievements.ts，页面在 apps/ach.ts）
   icon   像素图标名（见 ui/pixel.ts）
   hidden 未解锁时在成就页显示 ???（Steam 隐藏成就）
   ------------------------------------------------------------
   今后加成就只需三步（不用动引擎）：
   1. 这里加一条定义
   2. achievements.ts 的 RULES 加一行判定（读 stats 计数器）
   3. 对应程序里 stats.bump("key") / stats.once("egg.xxx") 埋点
   ============================================================ */

export interface AchDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  hidden?: boolean;
}

export const ACHIEVEMENTS: AchDef[] = [
  /* ---- 彩蛋猎人（隐藏） ---- */
  { id: "xyzzy", name: "祖传咒语", desc: "在扫雷里念对了那句 1992 年的咒语", icon: "mine", hidden: true },
  { id: "div0", name: "宇宙的拒绝", desc: "除以零，并被宇宙礼貌地拒绝", icon: "calc", hidden: true },
  { id: "e5318008", name: "倒过来看看", desc: "有些数字，倒过来看别有深意", icon: "calc", hidden: true },
  { id: "equals10", name: "打破砂锅", desc: "连按了十次等号，问到了底", icon: "calc", hidden: true },
  { id: "search", name: "搜一搜，不知道", desc: "找到了藏在导航角落的搜索引擎", icon: "globe", hidden: true },
  { id: "news", name: "旧闻记者", desc: "读完了 1998 年的新闻，真的和假的", icon: "text", hidden: true },
  { id: "p404", name: "此路不通", desc: "撞上了经典的「该页无法显示」", icon: "warn", hidden: true },
  { id: "offline", name: "猫的挣扎", desc: "拨号了，但这台电脑没插电话线", icon: "globe", hidden: true },
  { id: "soundcard", name: "声卡基金", desc: "关心了一下站长的声卡基金余额", icon: "info", hidden: true },
  { id: "mail", name: "信鸽培训中", desc: "试着给站长写了一封信", icon: "text", hidden: true },
  { id: "konami", name: "你是老玩家", desc: "上上下下左右左右 BA", icon: "logo", hidden: true },
  { id: "bsod", name: "蓝屏幸存者", desc: "见识了 0E 异常，并活了下来", icon: "computer", hidden: true },
  /* ---- 游戏里程碑 ---- */
  { id: "snake10", name: "小蛇初长成", desc: "贪吃蛇单局拿到 10 分", icon: "snake" },
  { id: "snake30", name: "蛇中赤兔", desc: "贪吃蛇单局拿到 30 分", icon: "snake" },
  { id: "mineB", name: "雷区新兵", desc: "扫雷初级首次清场", icon: "mine" },
  { id: "mineI", name: "工兵证书", desc: "扫雷中级首次清场", icon: "mine" },
  { id: "mineE", name: "拆弹专家", desc: "扫雷高级首次清场", icon: "mine" },
  /* ---- 咕咕亲密度 ---- */
  { id: "egg1", name: "第一颗蛋", desc: "收藏了云咕咕的第一颗蛋", icon: "egg" },
  { id: "egg10", name: "产能惊人", desc: "第 10 颗蛋，系统开始注意这只鸡", icon: "egg" },
  { id: "hatch", name: "新手妈妈", desc: "见证一只小鸡破壳", icon: "egg" },
  { id: "kick", name: "轻轻一甩", desc: "你踢了它……但它原谅你了", icon: "heart" },
  /* ---- 冲浪痕迹 & 生活情趣 ---- */
  { id: "surf", name: "冲浪冠军", desc: "走遍内联网的全部五个页面", icon: "globe" },
  { id: "guestbook", name: "文明上网", desc: "在留言板留下了脚印", icon: "text" },
  { id: "wallpaper", name: "换换心情", desc: "给桌面换了一张壁纸", icon: "floppy" },
  { id: "gravity", name: "万有引力", desc: "让一幅画自由落体", icon: "paint" },
];

export const ACH = {
  appName: "成就",
  toastTitle: "成就解锁",
  retroTitle: "历史战绩",
  retro: (n: number) => `检测到 1998 年的历史战绩\n补发 ${n} 个成就`,
  progress: (n: number, total: number) => `${n} / ${total}`,
  lockedName: "？？？",
  lockedDesc: "继续探索……",
  unlockedAt: (d: string) => `${d} 解锁`,
  soundOn: "音效：开",
  soundOff: "音效：关",
  reset: "重置",
  resetTitle: "清零所有成就与统计计数（调试用）",
  resetConfirm: "确定要清零所有成就吗？\n\n统计计数会一起清空（不清零的话，旧战绩会立刻把成就补发回来）。此操作不可恢复。",
  resetDone: "已清零。\n所有成就回到未解锁，像 1998 年刚开机一样。",
  about: "成就系统 v1.0\n\n每一声叮咚，\n都是对探索精神的表扬。\n\n（有 12 个成就是隐藏的）",
};

/* 任务栏托盘与时钟日历 */
export const TRAY = {
  ime: "输入法（装饰）",
  mute: "静音",
  unmute: "取消静音",
  calWeek: ["日", "一", "二", "三", "四", "五", "六"],
  calTitle: (y: number, m: number) => `${y}年${m}月`,
};

/* ============================================================
   扫雷：三级固定难度，彩蛋是 1992 年传下来的那串咒语
   ============================================================ */

export interface MineLevel {
  key: string;
  label: string;
  cols: number;
  rows: number;
  mines: number;
}

export const MINE_LEVELS: MineLevel[] = [
  { key: "beginner", label: "初级", cols: 9, rows: 9, mines: 10 },
  { key: "intermediate", label: "中级", cols: 16, rows: 16, mines: 40 },
  { key: "expert", label: "高级", cols: 30, rows: 16, mines: 99 },
];

export const MINE = {
  helpDesktop: "左键翻开 · 右键插旗/问号 · 数字上双击弦奏 · F2 新局",
  helpMobile: "点按翻开 · 长按插旗",
  about:
    "扫雷（云端1998 版）\n\n自 1992 年起陪每一台 Windows 值班。\n窗口左上角的像素从不说谎。",
  win: (label: string, time: number) =>
    `${label}难度，${time} 秒清场。\n雷区已经把你的名字记在小本本上。`,
  winRecord: (label: string, time: number) =>
    `新纪录！${label}难度 ${time} 秒。\n上一任纪录保持者（也是你）表示服气。`,
  lose: "轰。\n雷区不相信眼泪，但相信再来一局。",
  bestTitle: "最快纪录",
  bestEmpty: "还没有任何纪录。\n雷区静悄悄地等你。",
  bestRow: (label: string, time: number) => `${label}：${time} 秒`,
  cheatHint: "窗口的角落多了一个像素。它知道一些事情。",
};

/* ============================================================
   计算器：Win98 标准型。数字键下面埋了几个笑话。
   ============================================================ */

export const CALC = {
  errDiv0: "无法除以零",
  errOverflow: "溢出",
  div0Egg:
    "你不能除以零。\n这个问题 1998 年没解决，现在也没解决。\n宇宙刚刚拒绝了这次请求。",
  e5318008:
    "……你是故意的吧。\n把窗口倒过来再看看显示屏。\n这个梗可能比你的岁数都大。",
  equalsStreak: [
    "还在按？",
    "结果真的不会再变了。",
    "再按也不会变出钱来。",
    "好吧，送你一个终极答案：42",
    "……",
    "你赢了，你是这台计算器的主人。",
    "（计算器开始思考鸡生蛋蛋生鸡）",
    "再按下去，我只能重启 1998 年了。",
  ],
  copied: "已复制到剪贴板。\n（1998 年，「复制粘贴」还算个手艺）",
  about:
    "计算器（标准型）\n\n科学型要等 1999 年才发布。\n数字很老实，彩蛋不老实。",
  sciLocked: "科学型\n\n抱歉，科学型随 Office 2000 一起发布。\n（也就是说：遥遥无期）",
};

/* ============================================================
   我的浏览器：一张 1998 年的仿真内联网
   整个「互联网」都住在这台电脑里，不联任何真实网络。
   ============================================================ */

export const WEB = {
  appName: "我的浏览器",
  statusDone: "完成",
  opening: (url: string) => `正在打开页面 ${url} ...`,
  connecting: (url: string) => `正在连接 ${url} ...`,
  dialing: "正在拨号：163 ...",

  /* ---- 云端导航（首页） ---- */
  nav: {
    url: "cloud1998.yes",
    title: "云端导航 - 上网冲浪从这里开始",
    marquee: "欢迎来到云端导航！☆ 上网冲浪，从 YES 开始 ☆ 今天也是元气满满的一天！",
    counter: (n: number) => `您是第 ${n} 位访客`,
    sections: [
      {
        name: "本站推荐",
        links: [
          { label: "WeatherCore 的个人主页", desc: "站长的家，建设中但很温馨", to: "home", hide: false },
          { label: "云端留言板", desc: "踩一脚再走，文明上网", to: "guestbook", hide: false },
        ],
      },
      {
        name: "实用工具",
        links: [
          { label: "搜一搜", desc: "搜什么都有，就是不太对", to: "search", hide: true },
          { label: "1998 新闻中心", desc: "大事小事，真假难辨", to: "news", hide: true },
        ],
      },
    ],
    footer: "本站最佳分辨率 800×600 · 建议 Netscape 4.0 / Internet Explorer 4.0 以上浏览",
  },

  /* ---- WeatherCore 的个人主页 ---- */
  home: {
    url: "weathercore.yes",
    title: "★ WeatherCore 的家 ★",
    marquee: "欢迎欢迎热烈欢迎！这里是 WeatherCore 的小窝，随便看，别客气，记得去留言板踩一脚~",
    constructing: "本主页正在建设中，预计完工时间：待定",
    constructingSub: "（从 1998 年开工至今，热情从未减退）",
    counter: (n: number) => `您是第 ${n} 位贵客`,
    sectionsTitle: "· 自我介绍 ·",
    profileTitle: "· 个人档案 ·",
    mottoTitle: "· 今日座右铭 ·",
    linksTitle: "· 友情链接 ·",
    links: [
      { label: "云端导航", to: "nav" },
      { label: "云端留言板", to: "guestbook" },
      { label: "1998 新闻中心", to: "news" },
    ],
    mail: "给我写信",
    mailHint: "weathercore@cloud1998.yes\n\n邮局还没通网，信鸽正在培训中。\n（要不您去留言板留个言？）",
    sound: "背景音乐：开",
    soundHint:
      "对不起，站长还没攒够钱买声卡。\n（1998 年，一块好声卡真的要小两百块）\n\n你可以对着屏幕哼。",
  },

  /* ---- 留言板 ---- */
  guestbook: {
    url: "cloud1998.yes/guestbook",
    title: "云端留言板",
    intro: "来都来了，留个脚印再走。灌水可以，灌鸡汤不行。",
    nick: "昵称：",
    nickDefault: "无名氏",
    placeholder: "写点什么吧...（限 100 字）",
    submit: "留下脚印",
    empty: "还没有人留言。第一个脚印就是你的了。",
    thanks: "脚印已留下。文明上网，人人有责。",
    seed: [
      { name: "系统管理员", date: "1998-01-01", text: "欢迎使用云端1998留言板。文明上网，人人有责。" },
      { name: "网吧大神", date: "1998-06-13", text: "站长主页做得真好！友情链接已做好，常来踩踩~" },
      { name: "隔壁老王", date: "1998-07-02", text: "比隔壁二狗的主页强多了。就是背景音乐怎么没有？" },
      { name: "OICQ_888888", date: "1998-08-01", text: "加我OICQ！一起聊《还珠格格》，小燕子太可爱了~" },
      { name: "路过的小恐龙", date: "1998-09-15", text: "灌水~ 灌水~ ヾ(≧▽≦*)o" },
      { name: "猫猫爱吃鱼", date: "1998-11-20", text: "踩踩踩！回访必踩！也欢迎来我的「猫咪小窝」（还在建设中）" },
    ],
  },

  /* ---- 搜一搜（藏在角落的彩蛋） ---- */
  search: {
    url: "so.yes",
    title: "搜一搜 - 搜什么都有，就是不太对",
    brand: "搜一搜",
    slogan: "搜一搜，不知道",
    placeholder: "想知道点什么？",
    button: "搜一下",
    hits: (q: string, n: number) =>
      `找到约 ${n} 条与「${q}」相关的结果（用时 0.000${1 + Math.floor(Math.random() * 9)} 秒）`,
    gugu: [
      {
        title: "云咕咕 - 搜一搜百科",
        url: "baike.yes/wiki/云咕咕",
        snippet: "一只住在 WeatherCore 电脑桌面上的鸡。爱好：啄米、下蛋、被踢飞。",
        to: null,
      },
      {
        title: "为什么我同事的电脑屏幕上有一只鸡？- 搜一搜知道",
        url: "zhidao.yes/q/鸡",
        snippet: "最佳答案：那是站长的宠物，喂它吃谷粒会下蛋。别踢它，会生气。",
        to: null,
      },
    ],
    eggDetector: (found: number) =>
      `彩蛋探测器 v0.98 运行中：你已经发现 ${found} 个彩蛋。总数嘛……编辑自己也数不太清（反正 ≥ 10）。`,
    weather: [
      {
        title: "WeatherCore 天气 - 今日多云转晴",
        url: "weather.yes/wc",
        snippet: "适合写代码。紫外线指数：低（毕竟很少出门）。",
        to: null,
      },
    ],
    answer42: "答案是 42。\n但你先得想清楚，你问的到底是什么。",
    defaults: (q: string) => [
      {
        title: `${q} - 搜一搜百科`,
        url: `baike.yes/wiki/${q}`,
        snippet: `关于「${q}」的词条正在编写中，编写者吃饭去了。`,
        to: null,
      },
      {
        title: `${q}的最新消息_资讯`,
        url: `news.yes/search?w=${q}`,
        snippet: "1998 年还没有算法推荐，翻页请自带耐心。",
        to: "news",
      },
      {
        title: `谁知道${q}怎么办？急！在线等 - 搜一搜知道`,
        url: `zhidao.yes/q/${q}`,
        snippet: "楼主别急，先喝口水。热心的网友正在赶来的路上（56K）。",
        to: null,
      },
      {
        title: `${q} 相关下载（高速通道）`,
        url: `dl.yes/${q}.zip`,
        snippet: "预计剩余时间：47 小时。请勿挂断电话。",
        to: null,
      },
    ],
  },

  /* ---- 1998 新闻中心（藏在角落的彩蛋） ---- */
  news: {
    url: "news.yes",
    title: "1998 新闻中心",
    dateline: "1998 年 12 月 31 日 · 星期四 · 总第 1998 期",
    motto: "记录时代风云，也记录一点点胡说八道",
    items: [
      {
        date: "1998-07-12",
        title: "法国世界杯落幕，东道主 3:0 捧起大力神杯",
        body: "齐达内两记头球定乾坤。熬夜看球的同学们，明天早八请自重。",
      },
      {
        date: "1998-08-28",
        title: "长江抗洪取得全面胜利",
        body: "军民同心，严防死守。向最可爱的人致敬。",
      },
      {
        date: "1998-09-01",
        title: "《还珠格格》收视创纪录",
        body: "大街小巷都在放《当》。遥控器仿佛失去了换台的功能。",
      },
      {
        date: "1998-09-14",
        title: "微软正式发布 Windows 98",
        body: "装完之后，C 盘居然还能剩下两百多兆，令人震惊。",
      },
      {
        date: "1998-10-08",
        title: "本地程序员宣布「再改最后一个 Bug」",
        body: "专家提醒：按历史经验，「最后一个」通常后面还排着三到五个。",
        fake: true,
      },
      {
        date: "1998-11-11",
        title: "研究发现：程序员与咖啡存在量子纠缠",
        body: "观察一杯咖啡的坍缩状态，将直接影响当天下午的代码质量。论文已投《云端物理学报》。",
        fake: true,
      },
      {
        date: "1998-12-24",
        title: "气象台：明日天气晴，适合写代码",
        body: "本台特别提醒 WeatherCore 同学：晴天的代码 Bug 率下降约 3%。（云传感器独家供图）",
        fake: true,
      },
    ],
    fakeTag: "恶搞",
  },

  /* ---- 打不开的页面 ---- */
  notFound: {
    title: "该页无法显示",
    heading: "HTTP 404 - 该页无法显示",
    body: [
      "您寻找的页面当前不可用。网站可能遇到技术问题，或者您需要调整浏览器设置。",
      "",
      "请尝试以下操作：",
      "· 单击「刷新」按钮，或稍后重试；",
      "· 检查地址栏有没有拼错字；",
      "· 如果您确实想访问真实的互联网——",
      "  很遗憾，这台电脑的网线在 1998 年就拔了。",
    ],
    footer: "Internet Explorer（云端版）",
  },
  offline: {
    title: "无法建立连接",
    heading: "无法建立连接 - 没有调制解调器",
    body: (url: string) => [
      `无法连接到 ${url}。`,
      "",
      "原因很简单：这台电脑没有连接电话线。",
      "56K 猫虽然就位，但 1998 年的电话费按分钟计费，",
      "站长深思熟虑之后，决定让整个互联网都住在本地。",
      "",
      "试试在地址栏输入 cloud1998.yes，那是自家地盘。",
    ],
    footer: "拨号网络（从未成功过）",
  },
};
