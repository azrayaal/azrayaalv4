<script setup lang="ts">
/**
 * The home screen: function bar on top, content row in the middle, and the
 * Start button plus info cards under whichever tile is selected. The selected
 * tile stays pinned to the left edge and the row slides beneath it.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Icon from '@/components/Icon.vue';
import HintBar, { type Hint } from '@/components/HintBar.vue';
import { functionItems, homeTiles, type FunctionItem } from '@/data';
import { useInput, type Action } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { powerMenuOpen } from '@/composables/useSession';
import { sfx } from '@/composables/useSound';
import { homeState as state } from './homeState';

const { open } = useNav();

// ── Geometry ─────────────────────────────────────────────────────────────

const viewport = ref(window.innerWidth);
const onResize = () => (viewport.value = window.innerWidth);
onMounted(() => window.addEventListener('resize', onResize));
onBeforeUnmount(() => window.removeEventListener('resize', onResize));

const geometry = computed(() => {
  const w = viewport.value;
  const compact = w < 640;
  const big = compact ? 128 : Math.round(Math.min(230, Math.max(150, w * 0.14)));
  const small = Math.round(big * 0.6);
  const gap = compact ? 10 : 14;
  const anchor = Math.round(Math.min(72, Math.max(16, w * 0.05)));
  return { big, small, gap, anchor, compact };
});

const tilePosition = (index: number) => {
  const { big, small, gap, anchor } = geometry.value;
  const k = state.tile;
  const lift = big - small;
  if (index === k) return { x: anchor, y: 0, scale: 1 };
  if (index < k) return { x: anchor - (k - index) * (small + gap), y: lift, scale: small / big };
  return { x: anchor + big + gap + (index - k - 1) * (small + gap), y: lift, scale: small / big };
};

const selected = computed(() => homeTiles[state.tile]);
const cardTargets = computed(() => [{ id: 'start' }, ...selected.value.cards]);

// ── Input ────────────────────────────────────────────────────────────────

const moveTile = (delta: number) => {
  const next = state.tile + delta;
  if (next < 0 || next >= homeTiles.length) return;
  state.tile = next;
  state.card = 0;
  sfx.move();
};

const openTile = () => open(selected.value);

const openCard = (index: number) => {
  if (index === 0) openTile();
  else open(selected.value.cards[index - 1]);
};

const openFunction = (item: FunctionItem) => {
  if (item.action === 'power') {
    sfx.confirm();
    powerMenuOpen.value = true;
  } else {
    open(item);
  }
};

const handlers: Record<typeof state.zone, (action: Action) => void> = {
  tiles(action) {
    if (action === 'left') moveTile(-1);
    else if (action === 'right') moveTile(1);
    else if (action === 'up') {
      state.zone = 'function';
      sfx.move();
    } else if (action === 'down') {
      state.zone = 'cards';
      state.card = 0;
      sfx.move();
    } else if (action === 'cross' || action === 'options') openTile();
  },
  cards(action) {
    const last = cardTargets.value.length - 1;
    if (action === 'left' && state.card > 0) {
      state.card -= 1;
      sfx.move();
    } else if (action === 'right' && state.card < last) {
      state.card += 1;
      sfx.move();
    } else if (action === 'up' || action === 'circle') {
      state.zone = 'tiles';
      sfx.move();
    } else if (action === 'cross') openCard(state.card);
  },
  function(action) {
    const last = functionItems.length - 1;
    if (action === 'left' && state.fn > 0) {
      state.fn -= 1;
      sfx.move();
    } else if (action === 'right' && state.fn < last) {
      state.fn += 1;
      sfx.move();
    } else if (action === 'down' || action === 'circle') {
      state.zone = 'tiles';
      sfx.move();
    } else if (action === 'cross') openFunction(functionItems[state.fn]);
  },
};

useInput((action) => {
  if (action === 'ps') {
    state.zone = 'tiles';
    return;
  }
  handlers[state.zone](action);
});

// ── Pointer, wheel and touch ─────────────────────────────────────────────

const clickTile = (index: number) => {
  if (index === state.tile && state.zone === 'tiles') return openTile();
  state.zone = 'tiles';
  if (index !== state.tile) {
    state.tile = index;
    state.card = 0;
    sfx.move();
  }
};

const clickCard = (index: number) => {
  state.zone = 'cards';
  state.card = index;
  openCard(index);
};

const clickFunction = (index: number) => {
  state.zone = 'function';
  state.fn = index;
  openFunction(functionItems[index]);
};

let wheelLock = 0;
const onWheel = (event: WheelEvent) => {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (Math.abs(delta) < 12 || performance.now() < wheelLock) return;
  wheelLock = performance.now() + 160;
  state.zone = 'tiles';
  moveTile(delta > 0 ? 1 : -1);
};

let touchStart: { x: number; y: number } | null = null;
const onTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
};
const onTouchEnd = (event: TouchEvent) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
  state.zone = 'tiles';
  const steps = Math.max(1, Math.min(3, Math.round(Math.abs(dx) / 110)));
  moveTile(dx < 0 ? Math.min(steps, homeTiles.length - 1 - state.tile) : -Math.min(steps, state.tile));
};

const hints = computed<Hint[]>(() =>
  state.zone === 'function'
    ? [
        { button: 'cross', label: 'Enter' },
        { button: 'circle', label: 'Back' },
      ]
    : [
        { button: 'cross', label: state.zone === 'cards' ? 'Enter' : selected.value.startLabel },
        { button: 'options', label: 'Information' },
      ],
);

const cardsEl = ref<HTMLElement | null>(null);
// Scroll the card strip horizontally only; scrollIntoView would also pan the
// overflow-hidden home screen vertically.
watch(
  () => state.card,
  async (index) => {
    await nextTick();
    const strip = cardsEl.value;
    const card = strip?.querySelector<HTMLElement>(`[data-focus-key="${selected.value.id}:${index}"]`);
    if (!strip) return;
    if (!card) return strip.scrollTo({ left: 0, behavior: 'smooth' });
    const left = card.offsetLeft - strip.offsetLeft;
    if (left + card.offsetWidth > strip.scrollLeft + strip.clientWidth || left < strip.scrollLeft) {
      strip.scrollTo({ left: Math.max(0, left - 24), behavior: 'smooth' });
    }
  },
);

const isCardFocused = (index: number) => state.zone === 'cards' && state.card === index;
</script>

<template>
  <section class="home" :data-zone="state.zone">
    <!-- Function bar -->
    <nav class="fnbar" aria-label="Function bar">
      <button
        v-for="(item, index) in functionItems"
        :key="item.id"
        type="button"
        class="fnbar__item focusable"
        :class="{ 'is-focused': state.zone === 'function' && state.fn === index }"
        :aria-label="item.label"
        @click="clickFunction(index)"
      >
        <Icon :name="item.icon" :size="geometry.compact ? 22 : 28" :stroke="1.5" />
        <span class="fnbar__label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Content row -->
    <div class="stage" @wheel.passive="onWheel" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <div
        class="row"
        :style="{ '--big': `${geometry.big}px`, '--gap': `${geometry.gap}px`, '--anchor': `${geometry.anchor}px` }"
      >
        <button
          v-for="(tile, index) in homeTiles"
          :key="tile.id"
          type="button"
          class="tile focusable"
          :class="[
            `tile--${tile.kind}`,
            {
              'tile--selected': index === state.tile,
              'tile--before': index < state.tile,
              'is-focused': index === state.tile && state.zone === 'tiles',
            },
          ]"
          :style="{
            transform: `translate(${tilePosition(index).x}px, ${tilePosition(index).y}px) scale(${tilePosition(index).scale})`,
          }"
          :aria-label="tile.title"
          :aria-current="index === state.tile"
          @click="clickTile(index)"
        >
          <img v-if="tile.image" :src="tile.image" :alt="''" class="tile__image" loading="lazy" />
          <span v-else class="tile__icon"><Icon :name="tile.icon ?? 'Box'" :size="geometry.big * 0.32" :stroke="1.2" /></span>
          <span v-if="!tile.image" class="tile__caption">{{ tile.title }}</span>
        </button>

        <!-- Title of the selected tile sits in the space above the small tiles -->
        <Transition name="fade" mode="out-in">
          <div :key="selected.id" class="label">
            <h2>{{ selected.title }}</h2>
            <p>{{ selected.subtitle }}</p>
          </div>
        </Transition>
      </div>

      <!-- Start button + info cards -->
      <Transition name="fade" mode="out-in">
        <div :key="selected.id" class="info" :style="{ '--big': `${geometry.big}px`, '--anchor': `${geometry.anchor}px` }">
          <button
            type="button"
            class="start focusable"
            :class="{ 'is-focused': isCardFocused(0) }"
            @click="clickCard(0)"
          >
            {{ selected.startLabel }}
          </button>
          <div ref="cardsEl" class="cards">
            <button
              v-for="(card, index) in selected.cards"
              :key="card.id"
              :data-focus-key="`${selected.id}:${index + 1}`"
              type="button"
              class="card focusable"
              :class="{ 'is-focused': isCardFocused(index + 1), 'card--image': card.image }"
              @click="clickCard(index + 1)"
            >
              <img v-if="card.image" :src="card.image" alt="" class="card__image" loading="lazy" />
              <span v-else class="card__icon"><Icon :name="card.icon ?? 'Info'" :size="22" /></span>
              <span class="card__text">
                <strong>{{ card.title }}</strong>
                <span v-if="card.body">{{ card.body }}</span>
              </span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <HintBar :hints="hints" />
  </section>
</template>

<style scoped>
.home {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* ── Function bar ──────────────────────────────────────────────── */
.fnbar {
  position: absolute;
  z-index: 2; /* above the full-screen stage, or it swallows every click */
  top: 70px;
  left: var(--gutter);
  display: flex;
  gap: 10px;
  transition: transform 0.35s var(--ease), opacity 0.35s var(--ease);
  transform-origin: left top;
  opacity: 0.72;
}
.fnbar__item {
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 6px;
}
.fnbar__item:hover {
  background: var(--panel-hover);
}
.fnbar__label {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 15px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.home[data-zone='function'] .fnbar {
  opacity: 1;
  transform: translateY(6vh) scale(1.25);
}
.fnbar__item.is-focused {
  background: rgba(255, 255, 255, 0.12);
}
.fnbar__item.is-focused .fnbar__label {
  opacity: 1;
}

/* ── Content row ───────────────────────────────────────────────── */
.stage {
  position: absolute;
  inset: 0;
  transition: transform 0.4s var(--ease), opacity 0.4s var(--ease);
}
.home[data-zone='function'] .stage {
  transform: translateY(14vh);
  opacity: 0.35;
}
.home[data-zone='cards'] .stage {
  transform: translateY(-4vh);
}
.row {
  position: absolute;
  top: max(160px, 27vh);
  left: 0;
  right: 0;
  height: var(--big);
}
.tile {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--big);
  height: var(--big);
  border-radius: 4px;
  overflow: hidden;
  transform-origin: left top;
  background: var(--panel-strong);
  transition:
    transform 0.3s var(--ease),
    box-shadow 0.25s var(--ease),
    opacity 0.3s var(--ease);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.tile--before {
  opacity: 0.4;
}
.tile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tile__icon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding-bottom: 12%;
}
.tile__caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10%;
  font-size: calc(var(--big) * 0.085);
  font-weight: 600;
  text-align: center;
}
.tile--whats-new { background: linear-gradient(160deg, #ffb347, #e8590c); }
.tile--library { background: linear-gradient(160deg, #3f8cff, #1d3f9e); }
.tile--trophies { background: linear-gradient(160deg, #7a5cff, #34128a); }
.tile--resume { background: linear-gradient(160deg, #e8edf5, #9aa7bd); color: #14213d; }

.label {
  position: absolute;
  top: 0;
  left: calc(var(--anchor) + var(--big) + var(--gap) + 2px);
  right: var(--gutter);
  height: calc(var(--big) * 0.4 - 6px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  pointer-events: none;
}
.label h2 {
  margin: 0;
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 300;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.label p {
  margin: 2px 0 0;
  font-size: 15px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Start + info cards ────────────────────────────────────────── */
.info {
  position: absolute;
  top: calc(max(160px, 27vh) + var(--big) + 22px);
  left: var(--anchor);
  right: 0;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.start {
  flex: none;
  width: var(--big);
  height: 52px;
  border-radius: 4px;
  background: var(--panel-strong);
  border: 1px solid var(--line);
  font-size: 18px;
}
.start:hover,
.card:hover {
  background: rgba(255, 255, 255, 0.14);
}
.cards {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 6px 16px 16px 6px;
  margin: -6px 0 0 -6px;
  scrollbar-width: none;
}
.cards::-webkit-scrollbar {
  display: none;
}
.card {
  flex: none;
  display: flex;
  flex-direction: column;
  width: 260px;
  min-height: 150px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid var(--line);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-align: left;
}
.card__image {
  width: 100%;
  height: 92px;
  object-fit: cover;
  object-position: top;
}
.card__icon {
  padding: 16px 16px 0;
  color: var(--accent);
}
.card__text {
  display: grid;
  gap: 4px;
  padding: 12px 16px 14px;
  font-size: 14px;
  color: var(--text-dim);
}
.card__text strong {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
.card__text span {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Compact (phones) ─────────────────────────────────────────── */
@media (max-width: 639px) {
  .fnbar {
    top: 54px;
    gap: 2px;
  }
  .fnbar__item {
    width: 42px;
    height: 42px;
  }
  .home[data-zone='function'] .fnbar {
    transform: translateY(4vh);
  }
  .row {
    top: 150px;
  }
  .label {
    height: calc(var(--big) * 0.4 - 4px);
  }
  .label p {
    display: none;
  }
  .info {
    top: calc(150px + var(--big) + 18px);
    flex-direction: column;
    gap: 12px;
    right: 0;
  }
  .start {
    width: calc(100vw - 2 * var(--anchor));
    height: 46px;
  }
  .cards {
    width: calc(100vw - var(--anchor));
  }
  .card {
    width: 210px;
    min-height: 130px;
  }
  .card__image {
    height: 72px;
  }
}

@media (max-height: 620px) and (min-width: 640px) {
  .row {
    top: 150px;
  }
  .info {
    top: calc(150px + var(--big) + 18px);
  }
}
</style>
