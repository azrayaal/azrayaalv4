<script setup lang="ts">
/** Rest mode: the screen goes dark and a soft orange light breathes until woken. */
import { useInput } from '@/composables/useInput';
import { phase } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';

const wake = () => {
  sfx.boot();
  phase.value = 'home';
};

useInput(wake);
</script>

<template>
  <div class="rest" @click="wake">
    <span class="rest__light" />
    <p>Rest mode · press any button</p>
  </div>
</template>

<style scoped>
.rest {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  background: #000;
  cursor: pointer;
  animation: rest-in 1.2s ease both;
}
@keyframes rest-in {
  from { opacity: 0; }
}
.rest__light {
  width: 160px;
  height: 4px;
  border-radius: 4px;
  background: #ff8a1f;
  box-shadow: 0 0 24px 4px rgba(255, 138, 31, 0.6);
  animation: rest-pulse 3s ease-in-out infinite;
}
@keyframes rest-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
}
</style>
