<script setup lang="ts">
/**
 * A project opened from home or the library, laid out like a game hub: the
 * cover fills the background, actions sit under the title, screenshots run
 * along the bottom and open full screen.
 */
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import Glyph from '@/components/Glyph.vue';
import type { Hint } from '@/components/HintBar.vue';
import { getProjectBySlug, projectsByYear, statusLabel } from '@/data';
import { useInput } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { unlock } from '@/composables/useNotify';
import { useScrollFocus } from '@/composables/useScrollFocus';
import { sfx } from '@/composables/useSound';

const route = useRoute();
const { open, back, router } = useNav();

const project = computed(() => getProjectBySlug(String(route.params.slug)));

onMounted(() => unlock('first-play'));

interface Action {
  id: string;
  label: string;
  icon: string;
  href?: string;
  run?: () => void;
}

const actions = computed<Action[]>(() => {
  const p = project.value;
  if (!p) return [];
  const list: Action[] = [];
  const website = p.links.website ?? p.links.demo;
  if (website) list.push({ id: 'site', label: 'Start', icon: 'ExternalLink', href: website });
  if (p.links.github) list.push({ id: 'github', label: 'Source', icon: 'Github', href: p.links.github });
  if (p.links.figma) list.push({ id: 'figma', label: 'Design', icon: 'PenTool', href: p.links.figma });
  list.push({ id: 'shots', label: 'Screenshots', icon: 'Image', run: () => openShot(0) });
  const i = projectsByYear.findIndex((x) => x.slug === p.slug);
  const next = projectsByYear[(i + 1) % projectsByYear.length];
  list.push({ id: 'next', label: `Next: ${next.title}`, icon: 'ChevronRight', run: () => goTo(next.slug) });
  return list;
});

const shots = computed(() => project.value?.contentImage ?? []);

// Focus: row 0 = actions, row 1 = screenshots.
const row = ref(0);
const col = ref(0);
const viewer = ref<number | null>(null);

watch(
  () => route.params.slug,
  () => {
    row.value = 0;
    col.value = 0;
    viewer.value = null;
  },
);

const goTo = (slug: string) => {
  sfx.confirm();
  void router.replace(`/project/${slug}`);
};

const openShot = (index: number) => {
  sfx.confirm();
  viewer.value = index;
};

const runAction = (action: Action) => {
  if (action.run) action.run();
  else open(action);
};

const rowLength = (r: number) => (r === 0 ? actions.value.length : shots.value.length);

useInput((input) => {
  if (viewer.value !== null) {
    if (input === 'left' && viewer.value > 0) {
      viewer.value -= 1;
      sfx.move();
    } else if (input === 'right' && viewer.value < shots.value.length - 1) {
      viewer.value += 1;
      sfx.move();
    } else if (input === 'circle' || input === 'cross') {
      sfx.back();
      viewer.value = null;
    }
    return;
  }

  if (input === 'circle') return back();
  if (input === 'left' && col.value > 0) {
    col.value -= 1;
    sfx.move();
  } else if (input === 'right' && col.value < rowLength(row.value) - 1) {
    col.value += 1;
    sfx.move();
  } else if (input === 'down' && row.value === 0 && shots.value.length) {
    row.value = 1;
    col.value = Math.min(col.value, shots.value.length - 1);
    sfx.move();
  } else if (input === 'up' && row.value === 1) {
    row.value = 0;
    col.value = Math.min(col.value, actions.value.length - 1);
    sfx.move();
  } else if (input === 'cross') {
    if (row.value === 0) runAction(actions.value[col.value]);
    else openShot(col.value);
  }
});

const body = ref<HTMLElement | null>(null);
useScrollFocus(body, () => `${row.value}:${col.value}`);

const hints = computed<Hint[]>(() =>
  viewer.value !== null
    ? [{ button: 'circle', label: 'Close' }]
    : [
        { button: 'cross', label: 'Enter' },
        { button: 'circle', label: 'Back' },
      ],
);

const focused = (r: number, c: number) => viewer.value === null && row.value === r && col.value === c;
</script>

<template>
  <ScreenShell :title="project?.title ?? 'Not found'" icon="Gamepad2" :hints="hints">
    <div v-if="project" class="hub">
      <div class="hub__backdrop" :style="{ backgroundImage: `url(${project.coverImage})` }" />

      <div ref="body" class="hub__body scroll-area">
        <div class="hub__hero">
          <img :src="project.thumbnail" alt="" class="hub__thumb" />
          <div class="hub__intro">
            <p class="hub__meta">
              <span class="status-dot" :class="`status-dot--${project.status}`" />
              {{ statusLabel[project.status] }} · {{ project.category }} · {{ project.year }}
            </p>
            <h2>{{ project.title }}</h2>
            <p class="hub__short">{{ project.shortDescription }}</p>
            <div class="hub__actions">
              <button
                v-for="(action, i) in actions"
                :key="action.id"
                type="button"
                class="hub__action focusable"
                :class="{ 'is-focused': focused(0, i), 'hub__action--primary': action.id === 'site' }"
                :data-focus-key="`0:${i}`"
                @click="row = 0; col = i; runAction(action)"
              >
                <Icon :name="action.icon" :size="18" />
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="hub__grid">
          <article class="panel hub__about">
            <h3>About</h3>
            <p>{{ project.description }}</p>
            <div class="hub__chips">
              <span v-for="tag in project.tags" :key="tag" class="chip">#{{ tag }}</span>
            </div>
          </article>
          <aside class="panel hub__facts">
            <h3>Information</h3>
            <dl>
              <div><dt>Role</dt><dd>{{ project.role }}</dd></div>
              <div><dt>Year</dt><dd>{{ project.year }}</dd></div>
              <div v-if="project.duration"><dt>Duration</dt><dd>{{ project.duration }}</dd></div>
              <div v-if="project.teamSize"><dt>Team</dt><dd>{{ project.teamSize }} people</dd></div>
              <div><dt>Status</dt><dd>{{ statusLabel[project.status] }}</dd></div>
            </dl>
            <h3>Tech stack</h3>
            <div class="hub__chips">
              <span v-for="tech in project.techStack" :key="tech" class="chip">{{ tech }}</span>
            </div>
          </aside>
        </div>

        <h3 class="hub__shots-title">Screenshots</h3>
        <div class="hub__shots">
          <button
            v-for="(src, i) in shots"
            :key="src"
            type="button"
            class="hub__shot focusable"
            :class="{ 'is-focused': focused(1, i) }"
            :data-focus-key="`1:${i}`"
            :aria-label="`Screenshot ${i + 1}`"
            @click="row = 1; col = i; openShot(i)"
          >
            <img :src="src" alt="" loading="lazy" />
          </button>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="viewer !== null" class="viewer" @click.self="viewer = null">
          <img :src="shots[viewer]" :alt="`${project.title} screenshot ${viewer + 1}`" />
          <p>
            <Glyph button="dpad" /> {{ viewer + 1 }} / {{ shots.length }}
          </p>
        </div>
      </Transition>
    </div>

    <div v-else class="missing panel">
      <p>This content could not be found.</p>
    </div>
  </ScreenShell>
</template>

<style scoped>
.hub {
  position: absolute;
  inset: 0;
}
.hub__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center top;
  filter: blur(28px) brightness(0.35) saturate(1.2);
  transform: scale(1.1);
  animation: backdrop-in 0.6s ease both;
}
@keyframes backdrop-in {
  from { opacity: 0; }
}
.hub__body {
  height: 100%;
  padding: 4px var(--gutter) 84px;
}
.hub__hero {
  display: flex;
  gap: 32px;
  align-items: flex-end;
}
.hub__thumb {
  width: clamp(140px, 18vw, 240px);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  flex: none;
}
.hub__intro {
  min-width: 0;
}
.hub__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  color: var(--text-dim);
}
.hub__intro h2 {
  margin: 4px 0 6px;
  font-size: clamp(30px, 4vw, 52px);
  font-weight: 300;
  line-height: 1.05;
}
.hub__short {
  margin: 0 0 18px;
  max-width: 62ch;
  color: var(--text-dim);
  font-size: 17px;
}
.hub__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px;
}
.hub__action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 4px;
  background: var(--panel-strong);
  border: 1px solid var(--line);
  font-size: 16px;
}
.hub__action--primary {
  min-width: 160px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
}
.hub__action:hover {
  background: rgba(255, 255, 255, 0.2);
}
.hub__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 1fr);
  gap: 16px;
  margin-top: 32px;
}
.panel {
  padding: 20px 22px;
}
h3 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.hub__about p {
  margin: 0 0 16px;
  line-height: 1.65;
  font-size: 17px;
}
.hub__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hub__facts dl {
  margin: 0 0 18px;
  display: grid;
  gap: 10px;
}
.hub__facts dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.hub__facts dt {
  color: var(--text-dim);
}
.hub__facts dd {
  margin: 0;
  text-align: right;
}
.hub__shots-title {
  margin-top: 28px;
}
.hub__shots {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 6px;
  margin: -6px;
  scrollbar-width: thin;
}
.hub__shot {
  flex: none;
  width: clamp(220px, 26vw, 360px);
  aspect-ratio: 16 / 10;
  border-radius: 4px;
  overflow: hidden;
  background: var(--panel-strong);
}
.hub__shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
.viewer {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  padding: 70px 16px;
  background: rgba(0, 0, 0, 0.88);
}
.viewer img {
  max-width: min(1400px, 92vw);
  max-height: 78vh;
  object-fit: contain;
  border-radius: 4px;
}
.viewer p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--text-dim);
}
.missing {
  max-width: 420px;
}
@media (max-width: 760px) {
  .hub__hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }
  .hub__grid {
    grid-template-columns: 1fr;
  }
}
</style>
