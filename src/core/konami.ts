/* 科乐美秘籍：↑↑↓↓←→←→BA → 像素雨 + 彩蛋对话框 */

import { DIALOGS } from "./content";
import { confetti } from "./fx";
import { stats } from "./stats";
import { wm } from "./wm";

const SEQ = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function initKonami() {
  let idx = 0;
  document.addEventListener("keydown", (e) => {
    if (e.code === SEQ[idx]) {
      idx++;
      if (idx === SEQ.length) {
        idx = 0;
        stats.once("egg.konami");
        confetti();
        wm.msgBox("秘籍", DIALOGS.konami, "info");
      }
    } else {
      idx = e.code === SEQ[0] ? 1 : 0;
    }
  });
}
