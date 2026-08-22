/* ============================================================
   星空引擎：1998 CRT 之梦
   手写 WebGL2 + GLSL，全在一个全屏三角形的 fragment shader 里：
   暖锈色域扭曲星云 + 冷白跃迁星流 + CRT 扫描线/曲率/辉光。
   零依赖、零纹理、零音频文件。降级与编排见 screensaver.ts。
   ============================================================ */

const VERT = `#version 300 es
void main() {
  vec2 v[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
  gl_Position = vec4(v[gl_VertexID], 0, 1);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;     /* 画布像素尺寸 */
uniform float uFlow;   /* 跃迁累计时间（速度积分而得，非墙钟） */
uniform float uSpeed;  /* 当前跃迁强度 0..1，控制星流速度与拖尾长度 */
uniform float uT;      /* 墙钟时间，驱动闪烁与星等呼吸 */
uniform int uStars;    /* 星流预算，低帧率时可调低 */
out vec4 fragColor;

#define PI 3.14159265359

/* ---------- 杂音与噪声 ---------- */

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1, 0));
  float c = hash21(i + vec2(0, 1));
  float d = hash21(i + vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}

/* ---------- 暖锈色星云：域扭曲 FBM，缓慢旋转漂移 ---------- */

vec3 nebRamp(float x) {
  x = clamp(x, 0.0, 1.0);
  vec3 c;
  if (x < 0.35) {
    c = mix(vec3(0.020, 0.012, 0.008), vec3(0.220, 0.072, 0.030), x / 0.35);
  } else if (x < 0.7) {
    c = mix(vec3(0.220, 0.072, 0.030), vec3(0.620, 0.220, 0.080), (x - 0.35) / 0.35);
  } else {
    c = mix(vec3(0.620, 0.220, 0.080), vec3(1.000, 0.680, 0.320), (x - 0.7) / 0.3);
  }
  return c;
}

vec3 nebula(vec2 uv) {
  float rot = uT * 0.004;
  mat2 r = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  vec2 p = r * uv * 1.6 + vec2(3.1, 7.7);
  vec2 drift = vec2(0.030, -0.022) * uT;
  vec2 q = vec2(fbm(p + drift), fbm(p + vec2(5.2, 1.3) - drift));
  float f = fbm(p + 1.8 * q + vec2(1.7, 9.2));
  float density = smoothstep(0.22, 0.95, f);
  /* 径向聚焦：中心浓、四角收黑，给跃迁让出视线焦点 */
  float rad = length(uv);
  density *= smoothstep(1.30, 0.20, rad) * 0.85 + 0.15;
  return nebRamp(density) * (0.55 + 0.45 * density);
}

/* ---------- 远景星尘：两层网格静态微星，永远有东西可看 ---------- */

vec3 dust(vec2 uv) {
  vec3 acc = vec3(0.0);
  for (int l = 0; l < 2; l++) {
    float fl = float(l);
    vec2 p = uv * (22.0 + fl * 18.0) + fl * 37.0;
    vec2 id = floor(p);
    vec2 sp = vec2(
      hash21(id + fl * 53.0),
      hash21(id.yx + fl * 91.0)
    );
    float m = hash21(id + fl * 7.7 + 13.0);
    if (m < 0.80) continue;
    float d = length(fract(p) - sp);
    float star = smoothstep(0.10 + 0.05 * m, 0.0, d);
    star *= 0.55 + 0.45 * sin(uT * (1.0 + m * 2.0) + m * 50.0);
    acc += vec3(0.70, 0.74, 0.85) * star * (0.10 + 0.28 * m);
  }
  return acc;
}

/* ---------- 跃迁星流：每颗星一条指向圆心的运动模糊线段 ---------- */

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

vec3 starfield(vec2 uv) {
  vec3 acc = vec3(0.0);
  /* flowRate 与 JS 侧 uFlow 的积分速率保持同一公式 */
  float fr = mix(1.2, 6.0, clamp(uSpeed, 0.0, 1.0));
  for (int i = 0; i < uStars; i++) {
    float fi = float(i);
    float h1 = hash11(fi * 127.1);
    float h2 = hash11(fi * 311.7 + 43.0);
    float h3 = hash11(fi * 74.7 + 91.0);
    float h4 = hash11(fi * 269.5 + 17.0);
    float ang = h1 * 2.0 * PI;
    float rad = 0.10 + 0.90 * sqrt(h2);
    vec2 dir = vec2(cos(ang), sin(ang)) * rad;
    float spd = 0.055 * (0.75 + 0.5 * h4);
    float z = fract(h3 + uFlow * spd);            /* 1 远 → 0 近 */
    if (z < 0.02 || z > 0.97) continue;
    /* 拖尾 = 1/24 秒的运动模糊：尾点在更深处 */
    float dz = spd * fr * 0.045;
    vec2 head = dir / z;
    vec2 tail = dir / (z + dz);
    if (min(head.x, tail.x) > 1.4 || max(head.x, tail.x) < -1.4) continue;
    if (min(head.y, tail.y) > 1.0 || max(head.y, tail.y) < -1.0) continue;
    float size = mix(0.004, 0.036, pow(1.0 - z, 2.0)) * (0.7 + 0.6 * h4);
    float d = segDist(uv, head, tail);
    float core = exp(-pow(d / size, 2.0));
    float halo = exp(-pow(d / (size * 4.0), 2.0)) * 0.30;
    /* 星流头部一颗亮芯，伪 bloom */
    float dHead = length(uv - head);
    float headGlow = exp(-pow(dHead / (size * 2.2), 2.0)) * 0.65;
    float m = core + halo + headGlow;
    /* 远端淡入、近端淡出（避免重生/飞出瞬间的突兀） */
    m *= smoothstep(1.0, 0.86, z) * smoothstep(0.0, 0.07, z);
    m *= 0.8 + 0.25 * sin(uT * 3.0 + h3 * 40.0);
    /* 冷白偏蓝，个别星星偏暖，和星云呼应 */
    vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.92, 0.80), step(0.85, h4));
    acc += tint * m * 1.35;
  }
  return acc;
}

/* ---------- 圆心目标辉光：整个跃迁的目的地 ---------- */

vec3 coreGlow(vec2 uv) {
  float r = length(uv);
  float breathe = 0.35 + 0.18 * sin(uT * 0.4);
  vec3 warm = vec3(1.0, 0.72, 0.35) * exp(-r * 2.6) * breathe;
  vec3 hot = vec3(1.0, 0.86, 0.62) * exp(-r * 7.0) * (0.55 + 0.65 * uSpeed);
  return warm + hot;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  /* CRT 玻璃曲率：径向桶形畸变 + 超出荧光屏范围的纯黑 */
  float r2 = dot(uv, uv);
  vec2 cuv = uv * (1.0 + 0.055 * r2);
  if (dot(cuv, cuv) > 1.45) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 col = nebula(cuv);
  col += dust(cuv);
  col += starfield(cuv);
  col += coreGlow(cuv);

  /* CRT 质感：暗角、扫描线、磷光呼吸与偶发电压波动 */
  float vig = 0.60 + 0.40 * smoothstep(1.25, 0.35, length(uv));
  col *= vig;
  col *= 0.88 + 0.12 * sin(gl_FragCoord.y * PI);
  col *= 0.985 + 0.015 * sin(uT * 90.0);
  float ev = hash11(floor(uT * 2.0));
  if (ev > 0.965) col *= 0.93;

  /* 软限幅，让热区过曝得像磷光而不是白噪声 */
  col = 1.0 - exp(-col * 1.35);

  fragColor = vec4(col, 1.0);
}`;

/* ============================================================
   JS 侧：编译、循环、跃迁节奏编排、性能降级
   ============================================================ */

export interface Starfield {
  dispose: () => void;
}

interface Degrade {
  stars: number;
  scale: number;
}

const PI = Math.PI;

const START_STARS = 96;
const MIN_STARS = 44;

export function createStarfield(canvas: HTMLCanvasElement): Starfield | null {
  let gl: WebGL2RenderingContext;
  try {
    gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    })!;
    if (!gl) return null;
  } catch {
    return null;
  }

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[starfield]", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  let program: WebGLProgram;
  try {
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[starfield]", gl.getProgramInfoLog(program));
      return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  } catch {
    return null;
  }

  /* 属性无关绘制也绑一个空 VAO，兼容较严格的实现 */
  gl.bindVertexArray(gl.createVertexArray());
  gl.useProgram(program);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uFlow = gl.getUniformLocation(program, "uFlow");
  const uSpeed = gl.getUniformLocation(program, "uSpeed");
  const uT = gl.getUniformLocation(program, "uT");
  const uStars = gl.getUniformLocation(program, "uStars");

  const degrade: Degrade = { stars: START_STARS, scale: 1 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2) * degrade.scale;
    canvas.width = Math.max(2, (innerWidth * dpr) | 0);
    canvas.height = Math.max(2, (innerHeight * dpr) | 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  addEventListener("resize", resize);

  /* 跃迁节奏：前 7 秒从静止缓入，之后 38 秒一周期的涌动呼吸 */
  const t0 = performance.now();
  let flow = 0;
  let last = t0;
  let raf = 0;
  let frames = 0;
  let acc = 0;

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05); /* 后台节流回来不跳帧 */
    last = now;
    const t = (now - t0) / 1000;

    let speed: number;
    if (t < 7) {
      speed = 0.06 + 0.49 * (t / 7) * (t / 7);
    } else {
      speed = 0.30 + 0.34 * (0.5 - 0.5 * Math.cos(((t - 7) * 2 * PI) / 38));
    }
    flow += dt * (1.2 + 4.8 * speed);

    gl.uniform1f(uFlow, flow);
    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uT, t);
    gl.uniform1i(uStars, degrade.stars);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* 性能护栏：每 2 秒结算一次帧率，先砍星流预算再降分辨率 */
    frames++;
    acc += dt;
    if (acc >= 2) {
      const fps = frames / acc;
      if (fps < 30 && degrade.scale > 0.6) {
        degrade.scale = Math.max(0.55, degrade.scale - 0.15);
        resize();
      } else if (fps < 45 && degrade.stars > MIN_STARS) {
        degrade.stars = Math.max(MIN_STARS, degrade.stars - 26);
      }
      frames = 0;
      acc = 0;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
