<script setup lang="ts">
/** Settings: sound, dynamic theme, colour theme, controls reference, system info. */
import { computed } from 'vue';
import Icon from '@/components/Icon.vue';
import Glyph from '@/components/Glyph.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { resetSettings, settings, themes } from '@/composables/useSettings';
import { sfx } from '@/composables/useSound';
import { notify } from '@/composables/useNotify';
import { useListFocus } from './useListFocus';

const themeIndex = computed(() => themes.findIndex((t) => t.id === settings.theme));

const cycleTheme = (delta: number) => {
  const next = (themeIndex.value + delta + themes.length) % themes.length;
  settings.theme = themes[next].id;
  sfx.move();
};

const rows = computed(() => [
  {
    id: 'sound',
    icon: 'Volume2',
    label: 'Sound effects',
    value: settings.sound ? 'On' : 'Off',
    run: () => {
      settings.sound = !settings.sound;
      sfx.confirm();
    },
  },
  {
    id: 'waves',
    icon: 'Waves',
    label: 'Dynamic theme',
    value: settings.waves ? 'On' : 'Off',
    run: () => {
      settings.waves = !settings.waves;
      sfx.confirm();
    },
  },
  {
    id: 'theme',
    icon: 'Palette',
    label: 'Theme',
    value: themes[themeIndex.value]?.label ?? '',
    run: () => cycleTheme(1),
  },
  {
    id: 'reset',
    icon: 'RotateCcw',
    label: 'Restore default settings',
    value: '',
    run: () => {
      resetSettings();
      sfx.confirm();
      notify({ title: 'Settings restored', body: 'Everything is back to default.', icon: 'Settings' });
    },
  },
]);

const { index, pick } = useListFocus(
  () => rows.value.length,
  (i) => rows.value[i].run(),
  (action, i) => {
    if (rows.value[i].id === 'theme' && (action === 'left' || action === 'right')) {
      cycleTheme(action === 'left' ? -1 : 1);
    }
  },
);

const controls = [
  { glyph: 'dpad' as const, keys: 'Arrow keys / WASD', label: 'Move' },
  { glyph: 'cross' as const, keys: 'Enter / Space', label: 'Select' },
  { glyph: 'circle' as const, keys: 'Esc / Backspace', label: 'Back' },
  { glyph: 'options' as const, keys: 'M', label: 'Information' },
];
</script>

<template>
  <ScreenShell title="Settings" icon="Settings">
    <div class="settings scroll-area">
      <ul ref="list" class="rows">
        <li v-for="(row, i) in rows" :key="row.id">
          <button
            type="button"
            class="row focusable"
            :class="{ 'is-focused': i === index }"
            :data-focus-key="`i:${i}`"
            @click="pick(i)"
          >
            <Icon :name="row.icon" :size="22" />
            <span class="row__label">{{ row.label }}</span>
            <span class="row__value">
              <template v-if="row.id === 'theme'">‹ {{ row.value }} ›</template>
              <template v-else>{{ row.value }}</template>
            </span>
          </button>
        </li>
      </ul>

      <section class="panel info">
        <h2><Icon name="Keyboard" :size="20" /> Controls</h2>
        <p>Keyboard, mouse, touch, or a real controller over USB / Bluetooth all work.</p>
        <dl>
          <div v-for="c in controls" :key="c.label">
            <dt><Glyph :button="c.glyph" /> {{ c.label }}</dt>
            <dd>{{ c.keys }}</dd>
          </div>
          <div>
            <dt><Icon name="Gamepad2" :size="18" /> Home</dt>
            <dd>P / Home · PS button</dd>
          </div>
        </dl>
      </section>

      <section class="panel info">
        <h2><Icon name="Info" :size="20" /> System information</h2>
        <dl>
          <div><dt>System software</dt><dd>azrayaal v4.0</dd></div>
          <div><dt>Built with</dt><dd>Vue 3 · TypeScript · Vite</dd></div>
          <div><dt>Hosting</dt><dd>Static site</dd></div>
        </dl>
      </section>
    </div>
  </ScreenShell>
</template>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr);
  align-content: start;
  gap: 18px;
  height: 100%;
  padding: 4px;
}
.rows {
  grid-row: span 2;
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 60px;
  padding: 0 18px;
  border-radius: 4px;
  background: var(--panel);
  border: 1px solid var(--line);
  text-align: left;
  font-size: 17px;
}
.row:hover {
  background: rgba(255, 255, 255, 0.12);
}
.row__label {
  flex: 1;
}
.row__value {
  color: var(--text-dim);
}
.info {
  padding: 18px 20px;
}
.info h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}
.info p {
  margin: 0 0 12px;
  color: var(--text-dim);
}
.info dl {
  display: grid;
  gap: 10px;
  margin: 0;
}
.info dl div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.info dt {
  display: flex;
  align-items: center;
  gap: 8px;
}
.info dd {
  margin: 0;
  color: var(--text-dim);
  text-align: right;
}
@media (max-width: 860px) {
  .settings {
    grid-template-columns: 1fr;
  }
  .rows {
    grid-row: auto;
  }
}
</style>
