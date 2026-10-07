import { ref, useTemplateRef } from 'vue';
import { useInput, type Action } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { useScrollFocus } from '@/composables/useScrollFocus';
import { sfx } from '@/composables/useSound';

/**
 * The common vertical-list screen: ↑↓ moves, ✕ activates, ○ goes back.
 * `extra` handles anything else (← → on a setting, for instance).
 */
export function useListFocus(
  length: () => number,
  activate: (index: number) => void,
  extra?: (action: Action, index: number) => void,
) {
  const { back } = useNav();
  const index = ref(0);
  // The screen marks its scrolling list with ref="list".
  const root = useTemplateRef<HTMLElement>('list');

  useScrollFocus(root, () => `i:${index.value}`);

  useInput((action) => {
    if (action === 'circle') return back();
    if (action === 'up' && index.value > 0) {
      index.value -= 1;
      sfx.move();
    } else if (action === 'down' && index.value < length() - 1) {
      index.value += 1;
      sfx.move();
    } else if (action === 'cross') activate(index.value);
    else extra?.(action, index.value);
  });

  const pick = (i: number) => {
    index.value = i;
    activate(i);
  };

  return { index, pick };
}
