/**
 * Controller input.
 *
 * Keyboard and any connected gamepad (DualShock 4 included, via the Gamepad
 * API) are normalised into the same set of actions. Handlers form a stack:
 * only the most recently mounted one receives input, so a modal opened over a
 * screen takes the controller without the screen needing to know.
 */
import { onBeforeUnmount, onMounted } from 'vue';

export type Action =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'cross'
  | 'circle'
  | 'triangle'
  | 'square'
  | 'options'
  | 'ps';

export type InputHandler = (action: Action) => void;

const stack: InputHandler[] = [];

/** Runs before the stack; returning true consumes the action (the PS button). */
let globalHandler: ((action: Action) => boolean) | null = null;

export const setGlobalHandler = (handler: (action: Action) => boolean) => {
  globalHandler = handler;
};

export const dispatch = (action: Action) => {
  if (globalHandler?.(action)) return;
  stack[stack.length - 1]?.(action);
};

export function useInput(handler: InputHandler) {
  onMounted(() => stack.push(handler));
  onBeforeUnmount(() => {
    const index = stack.lastIndexOf(handler);
    if (index >= 0) stack.splice(index, 1);
  });
}

// ── Keyboard ─────────────────────────────────────────────────────────────

const keyMap: Record<string, Action> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  Enter: 'cross',
  ' ': 'cross',
  Escape: 'circle',
  Backspace: 'circle',
  t: 'triangle',
  q: 'square',
  m: 'options',
  Home: 'ps',
  p: 'ps',
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

const onKeyDown = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (isTyping(event.target)) {
    // While typing, only Escape leaves the field; everything else is text.
    if (event.key === 'Escape') {
      (event.target as HTMLElement).blur();
      event.preventDefault();
    }
    return;
  }

  const action = keyMap[event.key] ?? keyMap[event.key.toLowerCase()];
  if (!action) return;

  event.preventDefault();
  dispatch(action);
};

// ── Gamepad ──────────────────────────────────────────────────────────────

const buttonMap: Partial<Record<number, Action>> = {
  0: 'cross',
  1: 'circle',
  2: 'square',
  3: 'triangle',
  9: 'options',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
  16: 'ps',
};

const REPEAT_DELAY = 380;
const REPEAT_RATE = 110;
const STICK_THRESHOLD = 0.6;
const directions: Action[] = ['up', 'down', 'left', 'right'];

const held = new Map<Action, { since: number; last: number }>();
let polling = false;

const pressedActions = (pad: Gamepad) => {
  const pressed = new Set<Action>();
  pad.buttons.forEach((button, index) => {
    const action = buttonMap[index];
    if (action && button.pressed) pressed.add(action);
  });
  const [x = 0, y = 0] = pad.axes;
  if (x < -STICK_THRESHOLD) pressed.add('left');
  if (x > STICK_THRESHOLD) pressed.add('right');
  if (y < -STICK_THRESHOLD) pressed.add('up');
  if (y > STICK_THRESHOLD) pressed.add('down');
  return pressed;
};

const poll = (now: number) => {
  const pads = navigator.getGamepads?.() ?? [];
  const pressed = new Set<Action>();
  for (const pad of pads) if (pad) pressedActions(pad).forEach((a) => pressed.add(a));

  for (const action of pressed) {
    const state = held.get(action);
    if (!state) {
      held.set(action, { since: now, last: now });
      dispatch(action);
    } else if (
      directions.includes(action) &&
      now - state.since > REPEAT_DELAY &&
      now - state.last > REPEAT_RATE
    ) {
      state.last = now;
      dispatch(action);
    }
  }
  for (const action of [...held.keys()]) if (!pressed.has(action)) held.delete(action);

  if (pads.some(Boolean)) requestAnimationFrame(poll);
  else polling = false;
};

const startPolling = () => {
  if (polling) return;
  polling = true;
  requestAnimationFrame(poll);
};

let installed = false;

export function installInput() {
  if (installed) return;
  installed = true;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('gamepadconnected', startPolling);
}
