/**
 * Console power state: boot splash → user select → home, plus rest mode.
 * A session flag skips the boot sequence when the page is reloaded mid-visit.
 */
import { ref } from 'vue';

export type Phase = 'boot' | 'users' | 'home' | 'rest';

const KEY = 'azrayaal-v4-session';

const stored = (() => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
})();

export const phase = ref<Phase>(stored ? 'home' : 'boot');
export const user = ref<'azra' | 'guest'>(stored === 'guest' ? 'guest' : 'azra');
export const powerMenuOpen = ref(false);

export const logIn = (who: 'azra' | 'guest') => {
  user.value = who;
  phase.value = 'home';
  try {
    sessionStorage.setItem(KEY, who);
  } catch {
    /* Storage blocked — boot plays again on reload. */
  }
};

const forget = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
};

export const logOut = () => {
  forget();
  phase.value = 'users';
};

export const restart = () => {
  forget();
  phase.value = 'boot';
};

export const rest = () => {
  phase.value = 'rest';
};
