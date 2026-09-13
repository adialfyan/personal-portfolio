"use client";

import { useEffect, useRef } from "react";

interface DitherFieldProps {
  className?: string;
  /** Render scale (0–1). Lower is cheaper and chunkier. */
  scale?: number;
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float bayer(vec2 p) {
  vec2 ip = floor(mod(p, 4.0));
  float i = ip.y * 4.0 + ip.x;
  // 4x4 Bayer matrix, normalized 0..1
  if (i < 8.0) {
    if (i < 4.0) {
      if (i < 2.0) return i < 1.0 ? 0.0 / 16.0 : 8.0 / 16.0;
      return i < 3.0 ? 2.0 / 16.0 : 10.0 / 16.0;
    }
    if (i < 6.0) return i < 5.0 ? 12.0 / 16.0 : 4.0 / 16.0;
    return i < 7.0 ? 14.0 / 16.0 : 6.0 / 16.0;
  }
  if (i < 12.0) {
    if (i < 10.0) return i < 9.0 ? 3.0 / 16.0 : 11.0 / 16.0;
    return i < 11.0 ? 1.0 / 16.0 : 9.0 / 16.0;
  }
  if (i < 14.0) return i < 13.0 ? 15.0 / 16.0 : 7.0 / 16.0;
  return i < 15.0 ? 13.0 / 16.0 : 5.0 / 16.0;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  float aspect = u_res.x / u_res.y;

  // Slow drifting domain, gently pushed by the pointer.
  vec2 p = uv * vec2(aspect, 1.0) * 3.0;
  p += vec2(u_time * 0.03, -u_time * 0.02) + (u_pointer - 0.5) * 0.6;
  float n = vnoise(p) * 0.65 + vnoise(p * 2.4 + 7.3) * 0.35;

  // Keep the center calm so text stays readable.
  vec2 c = vec2(0.5 * aspect, 0.5);
  float d = distance(uv * vec2(aspect, 1.0), c);
  float mask = smoothstep(0.18, 0.62, d);

  float b = bayer(frag);
  float dot = step(b, n * mask * 0.85);

  vec3 paper = vec3(0.933, 0.914, 0.875);
  vec3 ink = vec3(0.090, 0.090, 0.082);
  gl_FragColor = vec4(mix(paper, ink, dot), 1.0);
}
`;

/**
 * Lightweight fullscreen dither shader: one quad, two noise octaves,
 * ordered Bayer threshold. Rendered small and upscaled (pixelated) so it
 * stays cheap on weak devices. Static single frame when the user prefers
 * reduced motion or WebGL is unavailable (CSS dot fallback shows instead).
 */
export function DitherField({ className, scale = 0.35 }: DitherFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // CSS fallback stays visible underneath.

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uPointer = gl.getUniformLocation(program, "u_pointer");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let disposed = false;
    let raf = 0;
    let visible = true;
    let io: IntersectionObserver | null = null;
    const pointer = { x: 0.5, y: 0.5 };
    const start = performance.now();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(2, Math.round(rect.width * scale));
      const h = Math.max(2, Math.round(rect.height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    const draw = (t: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = 1 - (e.clientY - rect.top) / rect.height;
    };

    if (reduced) {
      draw(0);
    } else {
      const loop = (now: number) => {
        if (disposed) return;
        if (visible && !document.hidden) {
          draw((now - start) / 1000);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) resize();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    window.addEventListener("resize", resize);
    wrap.addEventListener("pointermove", onMove);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [scale]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={className}
      // Static dot texture: visible while WebGL loads, or forever if it fails.
      style={{
        backgroundImage:
          "radial-gradient(rgba(23,23,20,0.16) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
