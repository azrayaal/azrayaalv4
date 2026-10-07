/**
 * System settings, persisted per browser. Storage can be blocked (private
 * windows, previews), so every access is guarded and defaults always apply.
 */
import { reactive, watch } from 'vue';

export type ThemeId = 'blue' | 'midnight' | 'purple' | 'crimson' | 'emerald';

export const themes: { id: ThemeId; label: string }[] = [
  { id: 'blue', label: 'Default (Blue)' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'purple', label: 'Amethyst' },
  { id: 'crimson', label: 'Crimson' },
  { id: 'emerald', label: 'Emerald' },
];

interface Settings {
  sound: boolean;
  waves: boolean;
  theme: ThemeId;
}

const KEY = 'azrayaal-v4-settings';
const defaults: Settings = { sound: true, waves: true, theme: 'blue' };

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
};

export const settings = reactive<Settings>(load());

watch(
  settings,
  (value) => {
    document.documentElement.dataset.theme = value.theme;
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* Storage blocked — settings last for this visit only. */
    }
  },
  { immediate: true, deep: true },
);

export const resetSettings = () => Object.assign(settings, defaults);
