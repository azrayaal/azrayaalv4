import { useRouter } from 'vue-router';
import { sfx } from './useSound';

/** Shared ✕ / ○ behaviour: open a route or link, and step back like the ○ button. */
export function useNav() {
  const router = useRouter();

  const open = (target: { to?: string; href?: string }) => {
    if (target.to) {
      sfx.confirm();
      void router.push(target.to);
    } else if (target.href) {
      sfx.confirm();
      window.open(target.href, '_blank', 'noopener');
    } else {
      sfx.deny();
    }
  };

  const back = () => {
    sfx.back();
    // Step back only when that leaves this screen; a previous entry that is
    // the same screen with another tab would make ○ look like it did nothing.
    const previous: unknown = window.history.state?.back;
    const samePath =
      typeof previous === 'string' && previous.split('?')[0] === router.currentRoute.value.path;
    if (previous && !samePath) router.back();
    else void router.push('/');
  };

  const home = () => {
    sfx.back();
    void router.push('/');
  };

  return { open, back, home, router };
}
