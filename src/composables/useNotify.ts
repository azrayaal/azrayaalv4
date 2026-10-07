/**
 * Top-left notification toasts and the visitor's own trophies — small rewards
 * for exploring, remembered per browser like PS4 trophies are per account.
 */
import { ref } from 'vue';
import { sfx } from './useSound';

export interface Toast {
  id: number;
  title: string;
  body: string;
  icon: string;
  trophy?: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export const toasts = ref<Toast[]>([]);
let seq = 0;

export const notify = (toast: Omit<Toast, 'id'>, duration = 4000) => {
  const id = ++seq;
  toasts.value.push({ ...toast, id });
  if (toast.trophy) sfx.trophy();
  else sfx.notify();
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

const visitorTrophies = {
  'first-play': { title: 'First Play', body: 'Opened your first project.', trophy: 'bronze' },
  collector: { title: 'Collector', body: 'Browsed the whole library.', trophy: 'bronze' },
  'say-hello': { title: 'Say Hello', body: 'Opened Messages.', trophy: 'silver' },
  completionist: { title: 'Completionist', body: 'Checked every trophy.', trophy: 'gold' },
} as const;

export type VisitorTrophy = keyof typeof visitorTrophies;

const KEY = 'azrayaal-v4-trophies';

const earned = (() => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set<string>();
  }
})();

export const unlock = (id: VisitorTrophy) => {
  if (earned.has(id)) return;
  earned.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...earned]));
  } catch {
    /* noop */
  }
  const trophy = visitorTrophies[id];
  window.setTimeout(
    () => notify({ title: `You've earned a trophy: ${trophy.title}`, body: trophy.body, icon: 'Trophy', trophy: trophy.trophy }),
    700,
  );
};
