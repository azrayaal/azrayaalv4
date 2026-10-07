<script setup lang="ts">
/** Power options dialog: rest mode, log out, restart. */
import { ref } from 'vue';
import Icon from './Icon.vue';
import HintBar from './HintBar.vue';
import { useInput } from '@/composables/useInput';
import { logOut, powerMenuOpen, rest, restart } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';

const options = [
  { id: 'rest', label: 'Enter Rest Mode', icon: 'Moon', run: rest },
  { id: 'logout', label: 'Log Out', icon: 'LogOut', run: logOut },
  { id: 'restart', label: 'Restart', icon: 'RotateCcw', run: restart },
];

const index = ref(0);

const close = () => {
  sfx.back();
  powerMenuOpen.value = false;
};

const choose = (i: number) => {
  sfx.confirm();
  powerMenuOpen.value = false;
  options[i].run();
};

useInput((action) => {
  if (action === 'up' && index.value > 0) {
    index.value -= 1;
    sfx.move();
  } else if (action === 'down' && index.value < options.length - 1) {
    index.value += 1;
    sfx.move();
  } else if (action === 'cross') choose(index.value);
  else if (action === 'circle' || action === 'ps') close();
});
</script>

<template>
  <div class="power" role="dialog" aria-modal="true" aria-label="Power" @click.self="close">
    <div class="power__panel">
      <h2><Icon name="Power" :size="22" /> Power</h2>
      <button
        v-for="(option, i) in options"
        :key="option.id"
        type="button"
        class="power__option focusable"
        :class="{ 'is-focused': i === index }"
        @mouseenter="index = i"
        @click="choose(i)"
      >
        <Icon :name="option.icon" :size="22" />
        {{ option.label }}
      </button>
    </div>
    <HintBar :hints="[{ button: 'cross', label: 'Enter' }, { button: 'circle', label: 'Back' }]" />
  </div>
</template>

<style scoped>
.power {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  animation: power-in 0.25s var(--ease) both;
}
@keyframes power-in {
  from { opacity: 0; }
}
.power__panel {
  width: min(440px, 100%);
  display: grid;
  gap: 8px;
  padding: 22px;
  border-radius: 8px;
  background: var(--panel-strong);
  border: 1px solid var(--line);
}
h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 300;
}
.power__option {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 54px;
  padding: 0 18px;
  border-radius: 4px;
  text-align: left;
  font-size: 18px;
}
.power__option.is-focused {
  background: rgba(255, 255, 255, 0.12);
}
</style>
