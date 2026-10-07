<script setup lang="ts">
/** Top-right corner: signed-in user and the clock, present on every screen. */
import { computed } from 'vue';
import { profile } from '@/data';
import { useClock } from '@/composables/useClock';
import { user } from '@/composables/useSession';

const now = useClock();
const time = computed(() =>
  now.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
);
</script>

<template>
  <div class="status">
    <span class="status__user">
      <img v-if="user === 'azra'" :src="profile.avatar" alt="" class="status__avatar" />
      <span v-else class="status__avatar status__avatar--guest">G</span>
      <span class="status__name">{{ user === 'azra' ? profile.name : 'Guest' }}</span>
    </span>
    <span class="status__time">{{ time }}</span>
  </div>
</template>

<style scoped>
.status {
  position: fixed;
  top: 18px;
  right: var(--gutter);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 17px;
  color: var(--text-dim);
  pointer-events: none;
}
.status__user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status__avatar {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--line-strong);
}
.status__avatar--guest {
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
  color: #fff;
}
.status__time {
  font-variant-numeric: tabular-nums;
  font-weight: 300;
  font-size: 20px;
  color: #fff;
}
@media (max-width: 560px) {
  .status { top: 14px; gap: 12px; font-size: 15px; }
  .status__name { display: none; }
}
</style>
