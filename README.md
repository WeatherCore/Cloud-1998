<div align="center">

# 🖥️ 云端1998

**一台跑在浏览器里的 1998 年中文复古电脑——打开网站即开机，桌面即个人主页**

*不是「Win98 风格的网页」，而是一台完整的 1998 年电脑：Vite + TypeScript，零 UI 框架，零运行时依赖*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![零运行时依赖](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](./package.json)
[![应用产物 ~92KB](https://img.shields.io/badge/%E4%BA%A7%E7%89%A9%E5%A4%A7%E5%B0%8F-%E7%BA%A692KB-9CF?style=flat-square)](#-技术栈)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=flat-square)](./LICENSE)

[快速开始](#-快速开始) · [架构总览](#-架构总览) · [功能全景](#-功能全景) · [成就与彩蛋](#-成就系统) · [项目结构](#-项目结构) · [换成你的](#-换成你自己的电脑)

</div>

---

## 📖 这是什么

> 它不是一套「仿 Win98 皮肤」，而是一台从 BIOS 自检开始启动的完整电脑：窗口会级联排列、任务栏能挂钟、屏保是一片星空——而「上网」永远出不了这台电脑，因为网线在 1998 年就拔了，**整个互联网都住在机箱里**。

**云端1998（Cloud 1998）** 是一个拟物系个人主页：访客双击桌面图标打开窗口，用 MS-DOS 终端敲命令，在「我的浏览器」里冲一张 1998 年的仿真内联网，用「我的电脑」看站长实时拉取的 GitHub 数据。开机一秒后，一只星露谷贴图的像素鸡「云咕咕」从屏幕左缘走进来常驻桌面——可以喂食、可以拎起来抛飞、它还会下蛋孵小鸡。

它同时是一份**零框架 DOM 工程的参考实现**：手写窗口管理器、像素图标编译器、WebGL2 星空引擎、WebAudio 合成音效、成就引擎与统计埋点，全部 33 个 TS 模块 + 2981 行手写 CSS，不引入任何运行时依赖，构建产物约 92KB。

## ✨ 核心亮点

| 支柱 | 说明 | 落点 |
|---|---|---|
| 🪟 **手写窗口系统** | 拖拽、八向缩放、焦点 z 序、级联定位、任务栏联动、Promise 化对话框（msgBox / confirm / prompt） | `src/core/wm.ts`（483 行） |
| 🐔 **云咕咕桌面宠物** | 14 态状态机 + 独立粒子系统：溜达啄食、闲置入睡、拎起抛飞、8 秒倒计时孵蛋、跟屁虫小鸡、事件驱动心情 | `src/core/chicken.ts`（1197 行） |
| 🖼️ **像素图标编译器** | 23 枚 16×16 字符画稿运行时编译成 crispEdges SVG，图标零图片文件——全站仅 3 张图片（两张壁纸 + 一张鸡贴图集） | `src/ui/pixel.ts` |
| 🔊 **零文件音效** | 窗口「嗒」、弹窗「叮」、开机 C 大调琶音、成就「叮咚」全部 WebAudio 现场合成，不发布任何音频文件 | `src/core/sound.ts` |
| 📊 **活数据个人主页** | 「我的电脑」实时拉取 GitHub 公开接口（sessionStorage 五分钟缓存 + AbortController 防竞态），作品集详情窗星数/语言现场读 | `src/apps/github.ts` · `src/apps/docs.ts` |
| 🏆 **成就引擎** | 25 枚成就（12 枚隐藏），统计埋点 → 规则判定 → Steam 式滑入通知 → 老玩家历史战绩静默补发 | `src/core/stats.ts` · `src/core/achievements.ts` |

## 🏗 架构总览

```mermaid
flowchart TB
    subgraph BOOT["boot.ts 开机序列"]
        B1["BIOS 自检刷屏<br/>内存计数 65536K · Detecting Dreams Found 1"] --> B2["启动画面 + 开机和弦<br/>第四版 · 千禧年倒计时 489 天"]
    end

    subgraph SHELL["桌面外壳"]
        DESK["桌面图标 · 右键菜单 · 气泡<br/>shell.ts"]
        BAR["任务栏 · 开始菜单 · 托盘时钟日历<br/>taskbar.ts"]
        WP["壁纸仓库 IndexedDB<br/>wallpapers.ts"]
    end

    subgraph WM["wm.ts 窗口管理器"]
        WM1["拖拽 · 八向缩放 · 级联定位<br/>焦点 z 序 · 任务栏联动"]
        WM2["Promise 对话框<br/>msgBox / confirmBox / promptBox"]
    end

    subgraph APPS["apps/ 程序层（15 个注册程序）"]
        A1["我的电脑<br/>GitHub 实时数据"]
        A2["我的浏览器<br/>5 页仿真内联网"]
        A3["扫雷 · 贪吃蛇<br/>计算器 · 画板"]
        A4["MS-DOS 终端<br/>20+ 命令 · 蓝屏彩蛋"]
        A5["我的文档 · 关于我 · 回收站<br/>记事本 · 成就 · 显示属性"]
    end

    subgraph CORE["core/ 系统服务"]
        S1["音效全合成 sound.ts"]
        S2["统计埋点 stats.ts<br/>egg.* 彩蛋约定"]
        S3["成就引擎 achievements.ts"]
        S4["星空屏保 screensaver.ts<br/>WebGL2 + CRT 唤醒"]
        S5["云咕咕 chicken.ts"]
        S6["像素图标编译器 ui/pixel.ts"]
    end

    B2 --> DESK
    DESK --> WM1
    BAR --> WM1
    WM1 --> APPS
    WM2 --> APPS
    A1 -. api.github.com .-> GH[("GitHub 公开接口")]
    APPS --> S2
    S2 --> S3
    S3 --> S1
    DESK -. 空闲 2 分钟 .-> S4
    S4 -.-|"星空上继续溜达"| S5
    WP -.- DESK
    S6 -.-> SHELL
```

每个程序只是一份 `AppDef`（id / 标题 / 像素图标 / 尺寸 / 菜单 / `build(ctx)`），注册进 `apps/index.ts` 就同时出现在桌面与开始菜单——`build` 返回的清理函数在关窗时自动执行，定时器不泄漏。

## 📦 功能全景

**桌面与系统**

- 🖥️ **完整桌面体验** — 图标单击选中/双击打开、桌面右键菜单（刷新/换壁纸/关于）、任务栏按钮与窗口焦点实时联动、开始菜单、托盘输入法与音量开关、时钟点击弹出本月日历
- ⌨️ **BIOS 开机序列** — Award BIOS 刷屏、逐 K 内存计数、IDE 设备检测（顺带检测了一下梦想），回访自动快进，任意点击可跳过
- 🌌 **星空屏保** — 空闲 2 分钟点火：WebGL2 单三角形 fragment shader 渲染暖锈色域扭曲星云 + 跃迁星流 + CRT 扫描线；不可用时自动降级 Canvas 2D 星空 + DVD 弹跳语录；退出时 CRT 通电闪，手动呼出附赠消磁「啵」
- 🎨 **壁纸管理** — 内建「草原 / 湖光」锁定不可删，自定义壁纸压缩后存 IndexedDB（最多 8 张，长边 1920），数据库不可用时优雅回退内建
- 🔊 **全合成音效** — 窗口开合「嗒」、弹窗「叮」、开机 C 大调琶音、成就「叮咚」，统一静音开关，浏览器拦截音频时静默失败不扫兴

**程序（双击即用）**

- 💻 **我的电脑** — 实时拉取 GitHub 用户与最近 5 个仓库：星数、语言色点、关注者，sessionStorage 五分钟缓存 + AbortController 防竞态，限流有兜底重试
- 🌐 **我的浏览器** — 一张住在本机里的 1998 年内联网：云端导航（跑马灯 + 仿 GIF 计数器）、站长小窝（建设中）、留言板（留言落款 1998 年）、搜一搜（搜「鸡」有惊喜）、1998 新闻中心（7 条新闻，3 条标了「恶搞」）；地址栏输什么域名都拨号失败——没插电话线
- 💣 **扫雷** — 三级经典难度（9×9×10 / 16×16×40 / 30×16×99），首点安全（第一下翻开前雷区不存在）、数字双击弦奏、问号标记、F2 新局、触屏长按插旗、各级最快纪录
- 🐍 **贪吃蛇** — 方向键 / WASD / 触屏滑动，空格暂停，最小化自动暂停防「看不见就死」，提速曲线 160→70ms，最高分持久化
- 🧮 **计算器** — 复刻 Win98 立即执行式引擎（非表达式求值），完整键盘支持、Win98 语义的 `%`、退格/CE/C，编辑菜单可复制
- 🎨 **画板** — 画笔/橡皮/三档粗细/十六色，保存 PNG；「重力」彩蛋把整幅画按 3px 网格碎成粒子雨欧拉积分落地（3800 粒子上限 + 睡眠计数 + 12 秒超时三重保护）
- ⌨️ **MS-DOS 方式** — 20+ 命令（含 `dir` / `winmine` / `www` 等别名与 `chicken` / `stars` / `sudo` 等未写进 help 的隐藏命令），↑↓ 翻命令历史
- 📝 **签名.txt 记事本** — 20 条励志签名收藏，保存会被系统礼貌拒绝
- 📁 **我的文档** — 作品集文件夹，双击开详情窗，星数/语言/更新时间现场拉真实仓库数据
- 🗑️ **回收站** — 里面躺着一份 4.2 MB 的「前任代码.cpp」，双击可以瞻仰遗容

## 🐔 云咕咕：桌面宠物鸡

开机一秒后从屏幕左缘走进来，从此常驻：

- 🚶 **自主行为** — 溜达、啄食、90 秒无人理睬就地入睡，被拎起会挣扎扑腾
- 🥚 **下蛋系统** — 蛋落地后 8 秒倒计时：手快点它收进档案（计数成就），手慢了破壳出一只排队跟妈妈走的小鸡（上限 2 只）
- 💥 **物理互动** — 拎起慢放是轻轻落地；松手瞬间速度超过 1300px/s 判定为甩击——撞墙反弹、满天羽毛、原地眩晕转圈
- 🌾 **喂食** — 右键菜单撒谷粒（终端 `chicken feed` 也行），吃饱了嗉子鼓鼓
- 📋 **属性面板** — 品种（白鸡·星露谷血统）、已收集蛋数、破壳小鸡数、首次相遇至今天数、随事件变化的心情（被踢/下蛋/当妈/吃饱/睡醒，优先级排序）
- 🌌 **双身份图层** — 平时挂在桌面层（窗口之下），被拎起或屏保激活时换父节点浮到星空之上继续溜达
- 👋 **放生与召回** — 右键「再见」走出屏幕，在 MS-DOS 方式输入 `chicken` 敲广播召回

## 🏆 成就系统

25 枚成就（**12 枚隐藏**，未解锁显示 ???），解锁时右下角 Steam 式滑入通知 + 「叮咚」上行纯五度；老玩家升版后历史战绩静默补发，只弹一条摘要。

| 类别 | 数量 | 代表 |
|---|---|---|
| 🥚 彩蛋猎人（隐藏） | 12 | 祖传咒语 · 宇宙的拒绝 · 倒过来看看 · 你是老玩家 · 蓝屏幸存者 |
| 🎮 游戏里程碑 | 5 | 蛇中赤兔（单局 30 分）· 拆弹专家（高级清场） |
| 🐔 咕咕亲密度 | 4 | 第一颗蛋 · 新手妈妈 · 轻轻一甩 |
| 🏄 冲浪痕迹 & 生活情趣 | 4 | 冲浪冠军（走遍内联网全部五个页面）· 万有引力 |

引擎与玩法解耦：`stats.ts` 只做 localStorage 计数器（彩蛋统一 `egg.*` 前缀），各程序埋点，成就引擎订阅计数变化跑 25 条规则。**加一枚成就只需三步**：`content.ts` 加定义 → `achievements.ts` 的 RULES 加一行判定 → 对应程序埋一个点，不用动引擎。

<details>
<summary><b>🥚 彩蛋索引（点开即剧透，建议先自己找）</b></summary>

| 彩蛋 | 触发方式 |
|---|---|
| 蓝屏幸存者 | 终端输入 `sudo rm -rf /`，看它删完 C:\回忆 后经典 0E 蓝屏 |
| 你是老玩家 | 键盘敲科乐美秘籍 ↑↑↓↓←→←→BA，奖励一场像素雨 |
| 祖传咒语 | 聚焦扫雷窗口敲 `xyzzy`，窗口角落亮起一个神秘像素 |
| 宇宙的拒绝 | 计算器除以零（或 1/x 零） |
| 倒过来看看 | 计算器显示屏凑出 5318008，把窗口倒过来 |
| 打破砂锅 | 计算器连按十次等号，问到底 |
| 万有引力 | 画板画点什么，然后按「重力」 |
| 搜一搜，不知道 | 浏览器地址栏输入 `so.yes`（导航页角落的暗链也通） |
| 旧闻记者 | 地址栏输入 `news.yes`，读完 1998 年的真新闻与假新闻 |
| 猫的挣扎 | 地址栏输入任何带点的域名，等 56K 猫挣扎 1.4 秒 |
| 此路不通 | 地址栏输入既不是站内页也没带点的词 |
| 声卡基金 / 信鸽培训中 | 站长小窝页点「背景音乐」与「给我写信」 |
| 换换心情 / 文明上网 | 换一张壁纸 / 在留言板留下脚印 |

</details>

## 🧰 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 语言 | TypeScript 5.5 | 33 个模块，构建时 `tsc --noEmit` 全量类型检查 |
| 构建 | Vite 5 | 仅有的一条 devDependency 链；`base: "./"` 相对路径，产物丢任意子目录都能跑 |
| UI | 原生 DOM | 零框架零运行时依赖，`el()` 工具函数 + 事件委托 |
| 存储 | localStorage / sessionStorage / IndexedDB | 存档与统计 / GitHub 五分钟缓存 / 自定义壁纸 |
| 图形 | Canvas 2D / WebGL2 + GLSL | 贪吃蛇扫雷画板像素雨 / 星空屏保（手写 shader） |
| 音频 | WebAudio API | 全部音效现场合成 |
| 样式 | 手写 CSS 2981 行 | Win98 控件三态、程序样式、咕咕动画互不掺和 |

应用构建产物约 92KB；全站仅 3 张图片（两张 1920 宽壁纸 + 一张鸡贴图集），图标零图片、音效零文件。

## 📁 项目结构

```
Cloud-1998/
├── index.html                 # 唯一入口；noscript：「这台 1998 年的电脑需要 JavaScript 才能开机」
├── public/
│   ├── sprites/gugu.png       #   云咕咕的星露谷原版贴图集（16px 帧 × 3 倍渲染）
│   ├── wallpapers/            #   草原 / 湖光两张内建壁纸
│   └── _headers               #   Cloudflare Pages：HTML no-store，治手机浏览器的旧缓存
└── src/
    ├── main.ts                # 28 行启动编排：wm → 开机 → 六个 init
    ├── styles/                # 2981 行手写 CSS（global / win98 控件 / apps / gugu）
    ├── core/                  # 系统层
    │   ├── wm.ts              #   窗口管理器：拖拽/八向缩放/焦点/级联/对话框
    │   ├── shell.ts           #   桌面图标、右键菜单、气泡提示
    │   ├── taskbar.ts         #   任务栏、开始菜单、托盘、时钟日历
    │   ├── boot.ts            #   BIOS 自检 → 启动画面 → 桌面
    │   ├── content.ts         #   673 行全站文案中枢（想改哪句话只动这里）
    │   ├── stats.ts           #   统计埋点：成就系统的唯一数据源
    │   ├── achievements.ts    #   25 条规则 + 滑入通知 + 历史补发
    │   ├── sound.ts           #   WebAudio 合成音效与静音开关
    │   ├── screensaver.ts     #   空闲屏保编排 + CRT 唤醒/消磁
    │   ├── starfield-gl.ts    #   手写 WebGL2/GLSL 星空引擎（可降级）
    │   ├── chicken.ts         #   云咕咕：1197 行 14 态状态机
    │   ├── wallpapers.ts      #   IndexedDB 壁纸仓库（内建锁定 + 用户增删）
    │   ├── fx.ts              #   蓝屏 / 关机画面 / 像素雨
    │   └── konami / util / types
    ├── apps/                  # 程序层：github / about / docs / ie / paint / snake /
    │   │                      #   mine / calc / terminal / notepad / ach / bin /
    │   │                      #   display + index.ts 注册表（+ binfile / project 详情窗）
    └── ui/                    # pixel.ts 像素图标编译器（23 枚画稿）+ menubar.ts
```

<details>
<summary><b>🔧 工程细节：鲁棒性 / 性能 / 无障碍</b></summary>

- **localStorage 安全包装**（`util.ts`）：禁用站点数据的浏览器读写会抛 SecurityError，一律静默降级，不让整站白屏
- **prefers-reduced-motion**：开机自动快进、屏保保持熄火、像素雨跳过、CSS 动画冻结——云咕咕是唯一经声明的特区（宠物需要活着）
- **移动端适配**：`pointer: coarse` / 窄屏判定 → 图标单击即开、隐藏最大化按钮、窗口全屏化、扫雷格子按屏宽自适应缩放、贪吃蛇滑动操控、扫雷长按 450ms 插旗
- **XSS 防护**：GitHub 返回的 name/bio 全部 `textContent` 注入，不进 innerHTML
- **竞态与泄漏**：GitHub 请求 AbortController 可取消、关窗自动 abort；每个程序的定时器/rAF/监听通过 `build` 返回的清理函数统一回收
- **性能上限**：画板粒子 3800 上限 + 睡眠计数 + 12 秒超时；confetti 设备像素比封顶 2；咕咕 rAF 按需启停
- **成就重置顺序**：先清计数再清成就，顺序反了会被 evaluate 立刻补发回来（源码里有注释解释）

</details>

## 🚀 快速开始

**0️⃣ 环境要求**

| 组件 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 18 | Vite 5 的最低要求 |
| npm | ≥ 9 | 随 Node 附带 |
| 浏览器 | 任意现代浏览器 | 屏保主路径需 WebGL2，缺失自动降级 Canvas 2D |

**1️⃣ 克隆并安装**（只有 2 个 devDependencies，秒级安装）

```bash
git clone https://github.com/WeatherCore/Cloud-1998.git
cd Cloud-1998
npm install
```

**2️⃣ 启动开发服务器**

```bash
npm run dev
# 打开终端提示的地址（默认 http://localhost:5173）
```

**3️⃣ 生产构建与本地预览**

```bash
npm run build     # tsc --noEmit 类型检查 + vite build → dist/
npm run preview   # 本地起服务验证 dist/ 产物
```

**4️⃣ 部署**：`dist/` 是纯静态目录，丢给任何静态托管即可（`base: "./"` 相对路径，挂子目录也能跑）。推给 Cloudflare Pages 可直接连仓库，`public/_headers` 已带 HTML `no-store` 配置；GitHub Pages / Vercel / Netlify / 自家 nginx 同样适用。

**5️⃣ 体验核心链路**（建议按顺序玩一遍）

1. 等开机 → 双击「MS-DOS 方式」→ 输入 `help`，再试试 help 里没写的命令
2. 终端输入 `sudo rm -rf /`，欣赏蓝屏，按任意键重新开机
3. 双击「我的浏览器」→ 地址栏输 `weathercore.yes` 看站长小窝，再随便输个 `google.com` 体验拨号失败
4. 双击「画板」随手画两笔 → 按「重力」
5. 什么都不动，等 2 分钟看星空屏保（或终端输 `stars`）；动一下鼠标，听 CRT 通电
6. 键盘敲 ↑↑↓↓←→←→BA
7. 右键云咕咕看属性，把它拎起来甩出去，再去终端 `chicken` 召回
8. 打开「成就」看看这一路解锁了几枚——剩下 12 枚隐藏的，慢慢找

## 🎨 换成你自己的电脑

整套系统按「一处修改」设计：**全站文案集中在 `src/core/content.ts`（673 行）**，头部注释就写着「想改网站上的任何一句话，只改这个文件」。

| 想改什么 | 动哪里 |
|---|---|
| 站长名 / GitHub 账号 / 开机欢迎语 / 系统名 | `content.ts` 的 `SITE` |
| 「关于我」与个人档案 | `content.ts` 的 `ABOUT` |
| 记事本与屏保的励志签名（现 20 条） | `content.ts` 的 `QUOTES` |
| 作品集项目（现 6 个，星数自动实时拉取） | `content.ts` 的 `PROJECTS` |
| 各程序文案与冷笑话（终端 / 蓝屏 / 扫雷 / 计算器 / 内联网五页） | `content.ts` 对应区块 |
| 桌面图标增减 | `apps/index.ts` 注册/移除一个 `AppDef` |
| 像素图标 | `ui/pixel.ts` 用字符画稿新增一枚（`.` 为透明，17 色调色板） |
| 新程序 | 任意 ts 导出一个 `AppDef`（`build(ctx)` 写内容，返回清理函数即可） |
| 新成就 | `content.ts` 加定义 → `achievements.ts` RULES 加一行 → 程序里 `stats.bump()` 埋点 |

## 🧭 Roadmap

- [x] 窗口管理器 + 桌面外壳 + 15 个程序
- [x] 云咕咕桌面宠物（孵蛋 / 小鸡 / 物理抛飞）
- [x] 成就引擎（25 枚 + 历史战绩补发）
- [x] WebGL2 星空屏保（含 Canvas 2D 降级）
- [x] 移动端适配与 prefers-reduced-motion 尊重
- [ ] 科学型计算器（官方口径：随 Office 2000 一起发布）
- [ ] 背景音乐（等站长的声卡基金攒够 1998 年的小两百块）
- [ ] 更多彩蛋（编辑自己也数不太清，反正 ≥ 10）

---

<div align="center">

**_现在可以安全地关闭计算机了_**（点击屏幕重新开机）

想给自己的 GitHub 造一台 1998 年的电脑？Fork 走就是了。

参与贡献：Fork → 新建分支 → 提交 PR——描述里讲讲你埋的彩蛋

MIT © 2026 Weather-Report · 项目地址 [WeatherCore/Cloud-1998](https://github.com/WeatherCore/Cloud-1998)

觉得这台电脑有意思，就给它一颗 ⭐ 吧

</div>
