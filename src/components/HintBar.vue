<script setup lang="ts">
/**
 * Bottom-right button guide. Each hint is also a real button, so touch and
 * mouse users can press ○ Back or ✕ Select without a controller.
 */
import Glyph from './Glyph.vue';
import { dispatch, type Action } from '@/composables/useInput';

export interface Hint {
  button: 'cross' | 'circle' | 'triangle' | 'square' | 'options';
  label: string;
}

defineProps<{ hints: Hint[] }>();

const press = (button: Hint['button']) => dispatch(button as Action);
</script>

<template>
  <nav class="hints" aria-label="Controls">
    <button v-for="hint in hints" :key="hint.button + hint.label" class="hints__item" type="button" @click="press(hint.button)">
      <Glyph :button="hint.button" />
      <span>{{ hint.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.hints {
  position: fixed;
  right: var(--gutter);
  bottom: 18px;
  z-index: 30;
  display: flex;
  gap: 22px;
  font-size: 16px;
  color: var(--text-dim);
}
.hints__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 4px;
  border-radius: 6px;
}
.hints__item:hover {
  color: #fff;
}
@media (max-width: 560px) {
  .hints {
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    gap: 14px;
    padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
    background: rgba(2, 8, 24, 0.82);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-top: 1px solid var(--line);
    font-size: 14px;
  }
}
</style>
