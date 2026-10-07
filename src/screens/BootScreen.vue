<script setup lang="ts">
/** Power-on: a dark screen waiting for a button press, then the boot chord. */
import { onBeforeUnmount, ref } from 'vue';
import Glyph from '@/components/Glyph.vue';
import { useInput } from '@/composables/useInput';
import { phase } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';
import { profile } from '@/data';

const stage = ref<'press' | 'booting'>('press');
let timer = 0;

const boot = () => {
  if (stage.value !== 'press') return;
  stage.value = 'booting';
  sfx.boot();
  timer = window.setTimeout(() => (phase.value = 'users'), 2600);
};

useInput(boot);
onBeforeUnmount(() => window.clearTimeout(timer));
</script>

<template>
  <div class="boot" :class="`boot--${stage}`" @click="boot">
    <div class="boot__mark">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="54" />
        <path d="M28 82 L44 38 L60 82 M34 67 H54 M66 38 H94 L66 82 H94" />
      </svg>
    </div>
    <p class="boot__word">{{ profile.name }}</p>
    <p class="boot__press">
      Press <Glyph button="cross" /> to start
      <span class="boot__tap">or tap anywhere</span>
    </p>
  </div>
</template>

<style scoped>
.boot {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  background: #000;
  cursor: pointer;
  transition: background 1.6s ease 0.9s;
}
.boot--booting {
  background: transparent;
}
.boot__mark svg {
  width: 120px;
  height: 120px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 420;
  stroke-dashoffset: 0;
  opacity: 0.85;
}
.boot--booting .boot__mark svg {
  animation: draw 1.6s var(--ease) both, glow 2.6s ease both;
}
@keyframes draw {
  from { stroke-dashoffset: 420; }
  to { stroke-dashoffset: 0; }
}
@keyframes glow {
  0% { filter: none; opacity: 0.4; }
  50% { filter: drop-shadow(0 0 18px rgba(var(--wave), 0.9)); opacity: 1; }
  100% { opacity: 0; transform: scale(1.06); }
}
.boot__word {
  margin: 0;
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.4em;
  text-transform: lowercase;
  opacity: 0;
}
.boot--booting .boot__word {
  animation: word 2.6s ease both;
}
@keyframes word {
  20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
.boot__press {
  position: absolute;
  bottom: 18vh;
  left: 0;
  right: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  animation: breathe 2.4s ease-in-out infinite;
}
.boot__tap {
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
.boot--booting .boot__press {
  opacity: 0;
  animation: none;
  transition: opacity 0.3s;
}
@keyframes breathe {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}
</style>
