import { reactive } from 'vue';

/** Home selection survives leaving and returning, like the console's row does. */
export const homeState = reactive({
  zone: 'tiles' as 'tiles' | 'cards' | 'function',
  tile: 0,
  card: 0,
  fn: 0,
});
