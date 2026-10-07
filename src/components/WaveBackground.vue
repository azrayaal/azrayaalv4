<script setup lang="ts">
/**
 * The dynamic theme: a gradient sky with silk-like ribbons of light flowing
 * across it and soft particles drifting up. Pauses when the tab is hidden and
 * renders a single still frame when motion is disabled.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { settings } from '@/composables/useSettings';

const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let width = 0;
let height = 0;
let rgb = '150, 205, 255';
let t = 0;
let last = 0;

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
}

let particles: Particle[] = [];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const animated = () => settings.waves && !reducedMotion.matches;

const readColor = () => {
  rgb = getComputedStyle(document.documentElement).getPropertyValue('--wave').trim() || rgb;
};

const resize = () => {
  const el = canvas.value;
  if (!el) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = el.clientWidth;
  height = el.clientHeight;
  el.width = Math.round(width * dpr);
  el.height = Math.round(height * dpr);
  ctx = el.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(60, (width * height) / 28000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.6 + Math.random() * 2.2,
    speed: 4 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
  }));
  if (!animated()) draw(0);
};

const ribbon = (baseY: number, amp: number, lines: number, spread: number, speed: number, alpha: number) => {
  if (!ctx) return;
  const step = Math.max(10, width / 140);
  for (let i = 0; i < lines; i++) {
    const k = i / lines;
    ctx.beginPath();
    for (let x = -step; x <= width + step; x += step) {
      const nx = x / width;
      const y =
        baseY +
        Math.sin(nx * 3.1 + t * 0.35 * speed + k * 0.9) * amp +
        Math.sin(nx * 7.3 - t * 0.22 * speed + k * 2.4) * amp * 0.35 +
        Math.sin(nx * 1.7 + t * 0.12) * (k - 0.5) * spread;
      if (x === -step) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const fade = 1 - Math.abs(k - 0.5) * 1.6;
    ctx.strokeStyle = `rgba(${rgb}, ${(alpha * fade).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const draw = (dt: number) => {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  const amp = Math.min(height * 0.09, 90);
  ribbon(height * 0.62, amp, 26, height * 0.22, 1, 0.22);
  ribbon(height * 0.7, amp * 0.8, 18, height * 0.16, 0.7, 0.14);

  for (const p of particles) {
    p.y -= p.speed * dt;
    p.x += Math.sin(t * 0.4 + p.phase) * 6 * dt;
    if (p.y < -10) {
      p.y = height + 10;
      p.x = Math.random() * width;
    }
    const twinkle = 0.35 + 0.35 * Math.sin(t * 1.5 + p.phase);
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    glow.addColorStop(0, `rgba(${rgb}, ${twinkle.toFixed(3)})`);
    glow.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';
};

const frame = (now: number) => {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  t += dt;
  draw(dt);
  raf = requestAnimationFrame(frame);
};

const start = () => {
  cancelAnimationFrame(raf);
  if (animated() && !document.hidden) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  } else {
    draw(0);
  }
};

const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());

onMounted(() => {
  readColor();
  resize();
  start();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', start);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', onVisibility);
  reducedMotion.removeEventListener('change', start);
});

watch(
  () => settings.theme,
  () => requestAnimationFrame(() => {
    readColor();
    if (!animated()) draw(0);
  }),
);
watch(() => settings.waves, start);
</script>

<template>
  <div class="sky" aria-hidden="true">
    <canvas ref="canvas" class="sky__canvas" />
    <div class="sky__vignette" />
  </div>
</template>

<style scoped>
.sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(120% 80% at 50% 0%, var(--bg-top) 0%, transparent 70%),
    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg-bottom) 100%);
  transition: background 0.6s var(--ease);
}
.sky__canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.sky__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(140% 100% at 50% 40%, transparent 55%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
}
</style>
