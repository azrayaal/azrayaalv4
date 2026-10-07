import { onBeforeUnmount, ref } from 'vue';

export function useClock() {
  const now = ref(new Date());
  const timer = window.setInterval(() => (now.value = new Date()), 10_000);
  onBeforeUnmount(() => window.clearInterval(timer));
  return now;
}
