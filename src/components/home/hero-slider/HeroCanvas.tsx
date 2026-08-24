"use client";

import { useEffect, useRef } from "react";
import { HERO_DESTINATIONS } from "@/lib/destinations";

/* The hero's WebGL background — Phase 3.

   A single fullscreen quad crossfades destinations with a procedural
   displacement warp: during a transition both photographs are pushed
   through the same noise field in opposite directions, so the old scene
   appears to dissolve into the new one instead of fading through grey.
   Between transitions the active photo runs a slow Ken Burns drift
   (1 → 1.05 over the slide's dwell).

   Raw WebGL on purpose: one shader, two textures, no react-three-fiber
   dependency for a single quad. Textures load through Next's image
   optimizer at the default quality so they share the browser cache with
   the <Image> fallback layer underneath.

   The component is mounted only when motion is allowed. It calls
   onReady() once every texture is on the GPU — the parent then drops
   the DOM image stack and this canvas owns the background. If WebGL is
   unavailable the parent never hears onReady and the DOM stack stays. */

const DESTS = HERO_DESTINATIONS;
const TRANS_DUR = 850; // ms, background displacement crossfade
const KB_DUR = 5200; // ms, Ken Burns 1 → 1.05 drift (one slide dwell)
const EASE = cubicBezier(0.21, 0.6, 0.35, 1); // the house curve

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress; /* eased 0..1 */
uniform float uZoomA;
uniform float uZoomB;
uniform vec2 uCoverA; /* cover-fit scale for A */
uniform vec2 uCoverB;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 fit(vec2 uv, vec2 cover, float zoom) {
  /* cover-fit about the centre, then zoom about the centre */
  return (uv - 0.5) * cover / zoom + 0.5;
}

void main() {
  float p = uProgress;
  /* two-octave noise field drives the warp; strongest mid-transition */
  float n = noise(vUv * 3.0) * 0.65 + noise(vUv * 7.0) * 0.35;
  vec2 dir = vec2(n - 0.5, (noise(vUv * 3.0 + 19.7) - 0.5) * 0.6);
  float amt = 0.38 * p * (1.0 - p) * 4.0; /* 0 at rest, peaks at p=.5 */

  vec2 uvA = fit(vUv + dir * amt * p, uCoverA, uZoomA);
  vec2 uvB = fit(vUv - dir * amt * (1.0 - p), uCoverB, uZoomB);

  vec4 a = texture2D(uTexA, clamp(uvA, 0.0, 1.0));
  vec4 b = texture2D(uTexB, clamp(uvB, 0.0, 1.0));

  /* slight dip keeps the mid-frame from going milky; the 1.12 lift matches
     the DOM fallback's brightness-[1.12] so the handoff is invisible */
  float m = smoothstep(0.12, 0.88, p);
  vec4 c = mix(a, b, m);
  float dip = 1.0 - 0.14 * p * (1.0 - p) * 4.0;
  gl_FragColor = vec4(clamp(c.rgb * 1.12 * dip, 0.0, 1.0), 1.0);
}`;

/* cubic-bezier(x1,y1,x2,y2) evaluator — same math the browser uses */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= (sampleX(t) - x) / dx;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

function optimizedUrl(src: string, w: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

type Tex = { tex: WebGLTexture; w: number; h: number };

export default function HeroCanvas({
  index,
  onReady,
}: {
  index: number;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* the rAF loop reads the target slide from a ref so the GL setup
     effect never re-runs on navigation */
  const target = useRef(index);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const st = {
      from: target.current,
      to: target.current,
      transStart: -1e9,
      slideStart: performance.now(),
      zoomFrozen: 1,
    };
    let prevTarget = target.current;

    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // parent keeps the DOM image stack

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    /* fullscreen triangle */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uTexA = U("uTexA"), uTexB = U("uTexB"), uProgress = U("uProgress");
    const uZoomA = U("uZoomA"), uZoomB = U("uZoomB");
    const uCoverA = U("uCoverA"), uCoverB = U("uCoverB");

    /* load every destination photo onto the GPU */
    const textures: (Tex | null)[] = DESTS.map(() => null);
    let ready = false;
    let disposed = false;
    const texW = Math.min(2048, Math.round(window.innerWidth * Math.min(devicePixelRatio, 2)));
    const optW = texW > 1200 ? 1920 : 1080;
    DESTS.forEach((d, i) => {
      const img = new window.Image();
      img.onload = () => {
        if (disposed) return;
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        textures[i] = { tex, w: img.naturalWidth, h: img.naturalHeight };
        if (!ready && textures.every(Boolean)) {
          ready = true;
          onReadyRef.current();
        }
      };
      img.src = optimizedUrl(d.heroImage, optW);
    });

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    window.addEventListener("resize", resize);

    /* background-size: cover, as a UV scale */
    const cover = (t: Tex): [number, number] => {
      const canvasAspect = canvas.width / Math.max(1, canvas.height);
      const imgAspect = t.w / t.h;
      return imgAspect > canvasAspect
        ? [canvasAspect / imgAspect, 1]
        : [1, imgAspect / canvasAspect];
    };
    const kbZoom = (ageMs: number) =>
      1 + 0.05 * Math.min(1, Math.max(0, ageMs) / KB_DUR);

    const bind = (unit: number, t: Tex) => {
      gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
    };

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready || document.hidden) return;

      /* pick up navigation: freeze the outgoing zoom, restart the clock */
      if (target.current !== prevTarget) {
        st.from = st.to;
        st.to = target.current;
        st.zoomFrozen =
          st.transStart + TRANS_DUR > now
            ? 1.06 /* interrupted mid-flight; close enough to keep it calm */
            : kbZoom(now - st.slideStart);
        st.transStart = now;
        /* Ken Burns starts counting once the crossfade has settled */
        st.slideStart = now + TRANS_DUR;
        prevTarget = target.current;
      }

      resize();
      const raw = Math.min(1, (now - st.transStart) / TRANS_DUR);
      const p = EASE(raw);
      const texA = textures[st.from]!;
      const texB = textures[st.to]!;

      bind(0, texA);
      bind(1, texB);
      gl.uniform1i(uTexA, 0);
      gl.uniform1i(uTexB, 1);
      gl.uniform1f(uProgress, p);
      /* outgoing drifts on from where its Ken Burns froze;
         incoming settles 1.06 → 1, then Ken Burns takes over */
      gl.uniform1f(uZoomA, st.zoomFrozen + 0.04 * p);
      gl.uniform1f(uZoomB, raw < 1 ? 1.06 - 0.06 * p : kbZoom(now - st.slideStart));
      gl.uniform2f(uCoverA, ...cover(texA));
      gl.uniform2f(uCoverB, ...cover(texB));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      textures.forEach((t) => t && gl.deleteTexture(t.tex));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  /* navigation only moves a ref; the loop notices on its next frame */
  useEffect(() => {
    target.current = index;
  }, [index]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
