<script setup lang="ts">
/** Notifications slide in at the top-left, exactly where the console puts them. */
import Icon from './Icon.vue';
import { toasts } from '@/composables/useNotify';
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast">
        <span class="toast__icon" :class="toast.trophy && `toast__icon--${toast.trophy}`">
          <Icon :name="toast.icon" :size="20" />
        </span>
        <span class="toast__text">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.body }}</span>
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  top: 18px;
  left: var(--gutter);
  z-index: 60;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(10, 14, 24, 0.88);
  border: 1px solid var(--line);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
.toast__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), var(--bg-mid));
}
.toast__icon--platinum { background: linear-gradient(135deg, #eef3fb, #7d8da8); color: #1b2a4a; }
.toast__icon--gold { background: linear-gradient(135deg, #ffe48a, #b07d0e); color: #3b2a00; }
.toast__icon--silver { background: linear-gradient(135deg, #f1f4f7, #8a96a3); color: #23303d; }
.toast__icon--bronze { background: linear-gradient(135deg, #f0c08f, #8a4f1c); color: #2e1606; }
.toast__text {
  display: grid;
  gap: 2px;
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-dim);
}
.toast__text strong {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s var(--ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
