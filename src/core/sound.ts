/* ============================================================
   系统音效：WebAudio 现场合成，零音频文件
   ------------------------------------------------------------
   四种声音：窗口开合「嗒」、弹窗「叮」、开机和弦、成就「叮-咚」。
   全部走同一个静音开关（任务栏音量图标 / 成就窗口按钮）。
   首次访问若用户从未点击过页面，浏览器会拦截音频——
   静默失败，不扫兴也不报错。
   ============================================================ */

import { store } from "./util";

const MUTE_KEY = "wc98-mute";

let audio: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

export const sound = {
  isMuted: () => store.get(MUTE_KEY) === "1",

  toggleMute(): boolean {
    const next = !this.isMuted();
    store.set(MUTE_KEY, next ? "1" : "0");
    return next;
  },

  /** 通用音符：at 为相对此刻的延迟（秒） */
  tone(freq: number, at: number, dur: number, vol: number, type: OscillatorType = "sine") {
    if (this.isMuted()) return;
    const c = ctx();
    if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },

  /** 窗口开/关的木质「嗒」 */
  tick() {
    if (this.isMuted()) return;
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.045);
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
  },

  /** 弹窗「叮」（G5 铃声 + 一个八度泛音） */
  ding() {
    this.tone(784, 0, 0.32, 0.08);
    this.tone(1568, 0, 0.18, 0.025);
  },

  /** 开机结束的和弦：C 大调琶音缓缓铺开 */
  chord() {
    if (this.isMuted()) return;
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const at = t + i * 0.06;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.045, at + 0.3);
      g.gain.setValueAtTime(0.045, at + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.7);
      o.connect(g);
      g.connect(c.destination);
      o.start(at);
      o.stop(at + 1.8);
    });
  },
};
