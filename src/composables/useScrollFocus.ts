import { nextTick, watch, type Ref } from 'vue';

/**
 * Keeps the focused element of a keyboard-driven list in view. Elements opt in
 * with `data-focus-key`; the watched key picks which one to reveal.
 */
export function useScrollFocus(root: Ref<HTMLElement | null>, key: () => string) {
  watch(key, async (value) => {
    await nextTick();
    root.value
      ?.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(value)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  });
}
