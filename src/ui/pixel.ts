/* ============================================================
   像素图标编译器
   图标以 16x16 字符画稿定义（. 为透明），运行时编译成 crispEdges SVG。
   说明：本项目的复古 Win98 主题要求位图风图标，图标库（线性图标）
   会破坏年代感，因此手绘像素画稿是本主题的正确选择。
   ============================================================ */

const PALETTE: Record<string, string> = {
  k: "#000000",
  w: "#ffffff",
  g: "#808080",
  l: "#c0c0c0",
  d: "#404040",
  b: "#000080",
  u: "#0000ff",
  c: "#00ffff",
  t: "#008080",
  n: "#008000",
  v: "#00ff00",
  y: "#ffff00",
  o: "#808000",
  r: "#ff0000",
  m: "#800000",
  p: "#ff00ff",
  e: "#dfdfdf",
};

const ICONS: Record<string, string[]> = {
  /* 我的电脑：显示器 + 主机 */
  computer: [
    "................",
    ".kkkkkkkkkkkkk..",
    ".kwwwwwwwwwwwk..",
    ".kwtttttttttwk..",
    ".kwtwtttttttwk..",
    ".kwtttttttttwk..",
    ".kwtwttwttwtwk..",
    ".kwtttttttttwk..",
    ".kwwwwwwwwwwwk..",
    ".kkkkkkkkkkkkk..",
    "....kkkkkkk.....",
    "..kkkkkkkkkkkk..",
    "..kllllllllllk..",
    "..klvllwllwllk..",
    "..kllllllllllk..",
    "..kkkkkkkkkkkk..",
  ],

  /* 关于我：证件卡 */
  about: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kbbbbbbbbbbk..",
    "..kbwwwwwwwwbk..",
    "..kkkkkkkkkkkk..",
    "..kwwwwwwwwwwk..",
    "..kwdddwgggggk..",
    "..kwdddwggggwk..",
    "..kwwwwwggwwkk..",
    "..kddddwggwwkk..",
    "..kddddwggggwk..",
    "..kddddwwwwwwk..",
    "..kwgggggggwwk..",
    "..kwwwwwwwwwwk..",
    "..kkkkkkkkkkkk..",
    "................",
  ],

  /* 画板：调色盘 + 画笔 */
  paint: [
    "...........oo...",
    "..........oo....",
    ".........oo.....",
    "........oo......",
    ".......oo.......",
    "......oo........",
    ".....gg.........",
    "....gg..........",
    "...dd..kkkkkk...",
    "...ddkwwwwwwwk..",
    "....dkwrybwnwk..",
    "...kkwwwkwwwwwk.",
    "....kwwwwwwwwk..",
    ".....kkkkkkkk...",
    "................",
    "................",
  ],

  /* 贪吃蛇：黑屏幕 + 绿蛇 + 红苹果 */
  snake: [
    "................",
    ".kkkkkkkkkkkkkk.",
    ".kllllllllllllk.",
    ".klkkkkkkkkkklk.",
    ".klkvvkkkkkkklk.",
    ".klkvkvkkkrkklk.",
    ".klkvkvkkkrkklk.",
    ".klkvkkkkkkkklk.",
    ".klkvvvvvkkkklk.",
    ".klkkkkkkkkkklk.",
    ".kllllllllllllk.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 终端：灰框 + 黑屏幕 + 提示符 */
  terminal: [
    "................",
    ".kkkkkkkkkkkkkk.",
    ".kllllllllllllk.",
    ".klbbbbbbbbbblk.",
    ".klkkkkkkkkkklk.",
    ".klkwkkkkkkkklk.",
    ".klkkwkkkkkkklk.",
    ".klkwkkkkkkkklk.",
    ".klkkkkkwwwkklk.",
    ".klkkkkkkkkkklk.",
    ".kllllllllllllk.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 签名.txt：白纸 + 折角 */
  text: [
    "..kkkkkkkkkk....",
    "..kwwwwwwwwkk...",
    "..kwwwwwwwkwwk..",
    "..kwwwwwwkkwwk..",
    "..kwggggwwkkkk..",
    "..kwwwwwwwwwk...",
    "..kwggggggwwk...",
    "..kwwwwwwwwwk...",
    "..kwgggggwwwk...",
    "..kwwwwwwwwwk...",
    "..kwggggggwwk...",
    "..kwwwwwwwwwk...",
    "..kwggwwwwwwk...",
    "..kkkkkkkkkkk...",
    "................",
    "................",
  ],

  /* 回收站 */
  bin: [
    "................",
    ".....kkkkkk.....",
    "...kkkkkkkkkk...",
    "...kllllllllk...",
    "..kkkkkkkkkkkk..",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "...kgkgkgkgk....",
    "....kkkkkkkk....",
    "................",
    "................",
    "................",
  ],

  /* WeatherCore 徽标：云 + 闪电 */
  logo: [
    "................",
    "................",
    "....kkkk........",
    "...kwwwwkk......",
    "..kwwwwwwkk.....",
    ".kwwwwwwwwwk....",
    ".kwwwwwkyywwkk..",
    ".kwwwwkyywwwkk..",
    "..kwwwkyywwwk...",
    "..kwwkyywwwk....",
    "...kkyykwwk.....",
    "....kyykk.......",
    "....kyyk........",
    ".....kyyk.......",
    ".....kyyk.......",
    "......kk........",
  ],

  /* 文件夹（我的文档） */
  folder: [
    "................",
    ".kkkkkk.........",
    ".kyyyyyk........",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kyyyyyyyyyyyyk.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 小火车（12306 项目专用占位图） */
  train: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kwwwwwwwwwwk..",
    "..kwbbwbbwbbwk..",
    "..kwbbwbbwbbwk..",
    "..kwwwwwwwwwwk..",
    "..kllllllllllk..",
    "..kyllllllllyk..",
    "..kkkkkkkkkkkk..",
    "....kk...kk.....",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 电源（关机用） */
  power: [
    "................",
    ".......k........",
    ".......k........",
    "......kkk.......",
    ".....kkkkk......",
    ".....kkkkk......",
    ".....kkkkk......",
    ".....kkkkk......",
    "....kkk.kkk.....",
    "...kkk...kkk....",
    "..kk......kk....",
    "..k........k....",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 帮助（问号） */
  help: [
    "................",
    ".....kkkkk......",
    "....kkkkkkk.....",
    "...kkk...kkk....",
    "...kk.....kk....",
    "..........kk....",
    ".........kk.....",
    "........kk......",
    ".......kk.......",
    ".......kk.......",
    "................",
    ".......kk.......",
    ".......kk.......",
    "................",
    "................",
    "................",
  ],

  /* 刷新 */
  refresh: [
    "................",
    "......kkk.......",
    ".....kkkkk......",
    "....kk...kk.....",
    "....k.....k.....",
    "..........kk....",
    "..kkkkkkkkkk....",
    "..kkkkkkkkk.....",
    "..k.............",
    "..k.....kk......",
    "....kk..kkk.....",
    ".....kkkkk......",
    "......kkk.......",
    "................",
    "................",
    "................",
  ],

  /* 信息（对话框用） */
  info: [
    "................",
    "....kkkkkkk.....",
    "..kkbbbbbbbkk...",
    ".kbbbbwwbbbbbk..",
    ".kbbbbwwbbbbbk..",
    ".kbbbbbbbbbbbk..",
    ".kbbbwwbbbbbbk..",
    ".kbbbwwbbbbbbk..",
    ".kbbbwwbbbbbbk..",
    ".kbbbwwwwbbbbk..",
    "..kbbbbbbbbbk...",
    "....kkkkkkk.....",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 警告（对话框用） */
  warn: [
    "................",
    ".......kk.......",
    "......kyyk......",
    "......kyyk......",
    ".....kyyyyk.....",
    ".....kyykyk.....",
    "....kyykyyk.....",
    "....kyykyyk.....",
    "...kyykkkyyk....",
    "...kyykkkyyk....",
    "..kyyyyyyyyyk...",
    "..kyyyykyyyyk...",
    ".kyyyyyyyyyyyk..",
    ".kkkkkkkkkkkkk..",
    "................",
    "................",
  ],

  /* 爱心（云咕咕互动用） */
  heart: [
    "................",
    "................",
    "..kkk....kkk....",
    ".krrrk..krrrk...",
    ".krrrrkkrrrrk...",
    ".krwrrrrrrrrk...",
    ".krrrrrrrrrrk...",
    "..krrrrrrrrk....",
    "...krrrrrrk.....",
    "....krrrrk......",
    ".....krrk.......",
    "......kk........",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 蛋（云咕咕下的蛋，点击收集） */
  egg: [
    "................",
    "................",
    "................",
    ".....kkkk.......",
    "....kwwwwk......",
    "...kwwwwwwk.....",
    "...kwwwwwek.....",
    "..kwwwwwwwek....",
    "..kwwwwwwwek....",
    "..kwwwwwwwek....",
    "...kwwwwwwk.....",
    "....kkkkkk......",
    "................",
    "................",
    "................",
    "................",
  ],

  /* 谷穗（喂食用） */
  grain: [
    "................",
    "......kk........",
    ".....kyok.......",
    "....kyoyok......",
    "....kyoyok......",
    ".....kyok.......",
    "......kk........",
    "......kk........",
    "......kk........",
    "......kk........",
    ".....kyok.......",
    "....kyoyok......",
    "....kyoyok......",
    ".....kyok.......",
    "......kk........",
    "................",
  ],

  /* 软盘（加载/保存用） */
  floppy: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kwwwwwwwwwbk..",
    "..kwwwwwwwwwbk..",
    "..kwwwkkkkwwbk..",
    "..kwwkllllkwbk..",
    "..kwwkllllkwbk..",
    "..kwwwkkkkwwbk..",
    "..kwwwwwwwwwbk..",
    "..kwwwwwwwwwbk..",
    "..kwlwwlwwlwbk..",
    "..kwlwwlwwlwbk..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
  ],
};

export type IconName = keyof typeof ICONS & string;

/** 画板调色盘（Win98 十六色） */
export const PAINT_COLORS: string[] = Object.values(PALETTE).filter(
  (c) => c !== "#dfdfdf"
);

export function iconSVG(name: string, size = 16): string {
  const rows = ICONS[name];
  if (!rows) return "";
  const h = rows.length;
  const w = 16;
  let rects = "";
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || ch === " ") {
        x++;
        continue;
      }
      let x2 = x;
      while (x2 + 1 < row.length && row[x2 + 1] === ch) x2++;
      const fill = PALETTE[ch] ?? "#ff00ff";
      rects += `<rect x="${x}" y="${y}" width="${x2 - x + 1}" height="1" fill="${fill}"/>`;
      x = x2 + 1;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ` +
    `shape-rendering="crispEdges" width="${size}" height="${size}" aria-hidden="true">${rects}</svg>`
  );
}

export function iconURL(name: string): string {
  return `data:image/svg+xml,${encodeURIComponent(iconSVG(name))}`;
}

/** 生成 <img> 图标元素 */
export function iconEl(name: string, size = 16): HTMLImageElement {
  const img = document.createElement("img");
  img.src = iconURL(name);
  img.width = size;
  img.height = size;
  img.alt = "";
  img.draggable = false;
  return img;
}

/* ---------- 标题栏按钮像素符号 ---------- */

export const GLYPHS: Record<string, string> = {
  min: `<svg viewBox="0 0 10 10" width="10" height="10" shape-rendering="crispEdges"><rect x="0" y="7" width="7" height="2" fill="#000"/></svg>`,
  max: `<svg viewBox="0 0 10 10" width="10" height="9" shape-rendering="crispEdges"><rect x="0" y="0" width="10" height="2" fill="#000"/><rect x="0" y="0" width="2" height="9" fill="#000"/><rect x="8" y="0" width="2" height="9" fill="#000"/><rect x="0" y="7" width="10" height="2" fill="#000"/></svg>`,
  restore: `<svg viewBox="0 0 10 10" width="10" height="9" shape-rendering="crispEdges"><rect x="3" y="0" width="7" height="2" fill="#000"/><rect x="3" y="0" width="2" height="6" fill="#000"/><rect x="8" y="0" width="2" height="6" fill="#000"/><rect x="3" y="4" width="7" height="2" fill="#000"/><rect x="0" y="3" width="2" height="6" fill="#000"/><rect x="0" y="7" width="7" height="2" fill="#000"/></svg>`,
  close: `<svg viewBox="0 0 10 10" width="10" height="9" shape-rendering="crispEdges"><path d="M0 0h2l3 3 3-3h2v2L6 5l4 3v2H8L5 7l-3 3H0V8l4-3L0 2z" fill="#000"/></svg>`,
};
