<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WaveBackground from '@/components/WaveBackground.vue';
import StatusBar from '@/components/StatusBar.vue';
import ToastStack from '@/components/ToastStack.vue';
import PowerMenu from '@/components/PowerMenu.vue';
import RestMode from '@/components/RestMode.vue';
import BootScreen from '@/screens/BootScreen.vue';
import UserSelect from '@/screens/UserSelect.vue';
import { homeState } from '@/screens/homeState';
import { setGlobalHandler } from '@/composables/useInput';
import { notify } from '@/composables/useNotify';
import { phase, powerMenuOpen, user } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';
import { profile } from '@/data';

const route = useRoute();
const router = useRouter();

// The PS button always returns home, whatever screen is open.
setGlobalHandler((action) => {
  if (action !== 'ps' || phase.value !== 'home' || powerMenuOpen.value) return false;
  homeState.zone = 'tiles';
  if (route.path !== '/') {
    sfx.back();
    void router.push('/');
  }
  return true;
});

// Browser back/forward can change screens under an open dialog; close it.
watch(
  () => route.fullPath,
  () => (powerMenuOpen.value = false),
);

watch(phase, (next, previous) => {
  if (next === 'home' && previous === 'users') {
    window.setTimeout(
      () =>
        notify({
          title: user.value === 'azra' ? `Welcome back, ${profile.headline}` : 'Welcome, Guest',
          body: profile.availability,
          icon: 'Radio',
        }),
      700,
    );
  }
});
</script>

<template>
  <WaveBackground />

  <template v-if="phase === 'home' || phase === 'rest'">
    <StatusBar />
    <main class="screen">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="screen" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>
  </template>

  <Transition name="fade">
    <UserSelect v-if="phase === 'users'" />
  </Transition>
  <BootScreen v-if="phase === 'boot'" />
  <PowerMenu v-if="powerMenuOpen" />
  <RestMode v-if="phase === 'rest'" />
  <ToastStack />
</template>

<style scoped>
.screen {
  position: fixed;
  inset: 0;
  z-index: 10;
}
</style>
