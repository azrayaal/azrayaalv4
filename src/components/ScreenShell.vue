<script setup lang="ts">
/** Frame shared by every screen opened from home: title, body, button guide. */
import Icon from './Icon.vue';
import HintBar, { type Hint } from './HintBar.vue';

withDefaults(defineProps<{ title: string; icon: string; hints?: Hint[] }>(), {
  hints: () => [
    { button: 'cross', label: 'Enter' },
    { button: 'circle', label: 'Back' },
  ],
});
</script>

<template>
  <section class="shell">
    <header class="shell__header">
      <Icon :name="icon" :size="26" />
      <h1>{{ title }}</h1>
    </header>
    <div class="shell__body">
      <slot />
    </div>
    <HintBar :hints="hints" />
  </section>
</template>

<style scoped>
.shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}
.shell__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px var(--gutter) 0;
  min-height: 66px;
}
.shell__header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 0.01em;
}
.shell__body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 18px var(--gutter) 72px;
}
@media (max-width: 560px) {
  .shell__header {
    min-height: 58px;
    padding-top: 14px;
  }
  .shell__header h1 {
    font-size: 20px;
  }
  .shell__body {
    padding-top: 12px;
  }
}
</style>
