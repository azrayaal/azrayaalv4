<script setup lang="ts">
/** "Who's using this controller?" — sign in as Azra or browse as a guest. */
import { ref } from 'vue';
import HintBar from '@/components/HintBar.vue';
import { useInput } from '@/composables/useInput';
import { logIn } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';
import { profile } from '@/data';

const users = [
  { id: 'azra' as const, name: profile.headline, sub: profile.name, avatar: profile.avatar },
  { id: 'guest' as const, name: 'Guest', sub: 'Visitor', avatar: '' },
];

const index = ref(0);

const choose = (i: number) => {
  if (i !== index.value) {
    index.value = i;
    sfx.move();
    return;
  }
  sfx.confirm();
  logIn(users[i].id);
};

useInput((action) => {
  if (action === 'left' && index.value > 0) {
    index.value -= 1;
    sfx.move();
  } else if (action === 'right' && index.value < users.length - 1) {
    index.value += 1;
    sfx.move();
  } else if (action === 'cross') choose(index.value);
});
</script>

<template>
  <section class="users">
    <h1>Who's using this controller?</h1>
    <div class="users__list">
      <button
        v-for="(u, i) in users"
        :key="u.id"
        type="button"
        class="user"
        :class="{ 'user--active': i === index }"
        @click="choose(i)"
      >
        <span class="user__avatar focusable" :class="{ 'is-focused': i === index }">
          <img v-if="u.avatar" :src="u.avatar" alt="" />
          <span v-else>G</span>
        </span>
        <strong>{{ u.name }}</strong>
        <span class="user__sub">{{ u.sub }}</span>
      </button>
    </div>
    <HintBar :hints="[{ button: 'cross', label: 'Log in' }]" />
  </section>
</template>

<style scoped>
.users {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 48px;
  padding: 24px;
  animation: users-in 0.8s var(--ease) both;
}
@keyframes users-in {
  from { opacity: 0; transform: scale(1.04); }
}
h1 {
  margin: 0;
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 300;
  text-align: center;
}
.users__list {
  display: flex;
  gap: clamp(20px, 5vw, 64px);
}
.user {
  display: grid;
  justify-items: center;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 0.25s, transform 0.25s var(--ease);
}
.user--active {
  opacity: 1;
  transform: scale(1.06);
}
.user__avatar {
  width: clamp(110px, 16vw, 180px);
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05));
  font-size: 56px;
  font-weight: 300;
  margin-bottom: 8px;
}
.user__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.user strong {
  font-size: 20px;
  font-weight: 400;
}
.user__sub {
  font-size: 14px;
  color: var(--text-dim);
}
</style>
