import "./styles/global.css";
import "./styles/win98.css";
import "./styles/apps.css";
import "./styles/gugu.css";
import { APPS } from "./apps";
import { runBoot } from "./core/boot";
import { initGugu } from "./core/chicken";
import { initKonami } from "./core/konami";
import { initSaver } from "./core/screensaver";
import { initShell } from "./core/shell";
import { initTaskbar } from "./core/taskbar";
import { isMobile } from "./core/util";
import { wm } from "./core/wm";

if (isMobile()) document.body.classList.add("mode-mobile");

wm.init(APPS);

runBoot(() => {
  initShell();
  initTaskbar();
  initSaver();
  initKonami();
  initGugu();
});
