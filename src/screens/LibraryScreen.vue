<script setup lang="ts">
/**
 * Library: categories down the left, every project as a tile on the right.
 * ← from the first column returns to the category list, like the console.
 */
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { projectsByYear, statusLabel } from '@/data';
import { useInput } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { unlock } from '@/composables/useNotify';
import { useScrollFocus } from '@/composables/useScrollFocus';
import { sfx } from '@/composables/useSound';

const { open, back } = useNav();

const categories = ['All', ...new Set(projectsByYear.map((p) => p.category))];
const category = ref(0);
const zone = ref<'side' | 'grid'>('grid');
const index = ref(0);

const items = computed(() =>
  category.value === 0
    ? projectsByYear
    : projectsByYear.filter((p) => p.category === categories[category.value]),
);

watch(category, () => (index.value = 0));

const grid = ref<HTMLElement | null>(null);
const columns = ref(5);
const measure = () => {
  const el = grid.value;
  if (!el) return;
  columns.value = getComputedStyle(el).gridTemplateColumns.split(' ').length;
};
onMounted(() => {
  measure();
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => window.removeEventListener('resize', measure));

const seen = new Set<number>();
watch(
  category,
  (c) => {
    seen.add(c);
    if (seen.size === categories.length) unlock('collector');
  },
  { immediate: true },
);

const move = (target: number) => {
  if (target < 0 || target >= items.value.length) return false;
  index.value = target;
  sfx.move();
  return true;
};

useInput((action) => {
  if (action === 'circle') return back();

  if (zone.value === 'side') {
    if (action === 'up' && category.value > 0) {
      category.value -= 1;
      sfx.move();
    } else if (action === 'down' && category.value < categories.length - 1) {
      category.value += 1;
      sfx.move();
    } else if (action === 'right' || action === 'cross') {
      zone.value = 'grid';
      sfx.move();
    }
    return;
  }

  const cols = columns.value;
  if (action === 'left') {
    if (index.value % cols === 0) {
      zone.value = 'side';
      sfx.move();
    } else move(index.value - 1);
  } else if (action === 'right') move(index.value + 1);
  else if (action === 'up') move(index.value - cols);
  else if (action === 'down') {
    if (!move(index.value + cols)) {
      // Last partial row: drop to the final tile instead of refusing.
      const lastRowStart = Math.floor((items.value.length - 1) / cols) * cols;
      if (index.value < lastRowStart) move(items.value.length - 1);
    }
  } else if (action === 'cross') open({ to: `/project/${items.value[index.value].slug}` });
});

const scroller = ref<HTMLElement | null>(null);
useScrollFocus(scroller, () => `p:${index.value}`);

const pickCategory = (i: number) => {
  zone.value = 'side';
  category.value = i;
  sfx.move();
};

const pickProject = (i: number) => {
  zone.value = 'grid';
  index.value = i;
  open({ to: `/project/${items.value[i].slug}` });
};
</script>

<template>
  <ScreenShell title="Library" icon="LayoutGrid">
    <div class="library">
      <nav class="library__side" aria-label="Categories">
        <button
          v-for="(name, i) in categories"
          :key="name"
          type="button"
          class="library__cat focusable"
          :class="{ 'is-current': i === category, 'is-focused': zone === 'side' && i === category }"
          @click="pickCategory(i)"
        >
          {{ name }}
          <span>{{ i === 0 ? projectsByYear.length : projectsByYear.filter((p) => p.category === name).length }}</span>
        </button>
      </nav>

      <div ref="scroller" class="library__main scroll-area">
        <p class="library__count">{{ items.length }} items · sorted by release</p>
        <div ref="grid" class="library__grid">
          <button
            v-for="(project, i) in items"
            :key="project.slug"
            type="button"
            class="game"
            :data-focus-key="`p:${i}`"
            @click="pickProject(i)"
          >
            <span class="game__art focusable" :class="{ 'is-focused': zone === 'grid' && i === index }">
              <img :src="project.thumbnail" alt="" loading="lazy" />
            </span>
            <strong>{{ project.title }}</strong>
            <span class="game__meta">
              <span class="status-dot" :class="`status-dot--${project.status}`" />
              {{ statusLabel[project.status] }} · {{ project.year }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </ScreenShell>
</template>

<style scoped>
.library {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 28px;
  height: 100%;
}
.library__side {
  display: grid;
  align-content: start;
  gap: 4px;
  overflow-y: auto;
  padding: 4px;
}
.library__cat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 4px;
  text-align: left;
  font-size: 16px;
  color: var(--text-dim);
}
.library__cat span {
  font-size: 14px;
  color: var(--text-faint);
}
.library__cat.is-current {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.library__cat:hover {
  background: var(--panel-hover);
}
.library__main {
  padding: 4px 8px 24px;
}
.library__count {
  margin: 0 0 14px;
  color: var(--text-faint);
  font-size: 14px;
}
.library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 22px 18px;
}
.game {
  display: grid;
  gap: 6px;
  text-align: left;
  min-width: 0;
}
.game__art {
  display: block;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  background: var(--panel-strong);
  margin-bottom: 4px;
}
.game__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.game:hover .game__art {
  transform: translateY(-3px);
}
.game strong {
  font-weight: 400;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.game__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-faint);
}
@media (max-width: 760px) {
  .library {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 14px;
  }
  .library__side {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .library__cat {
    flex: none;
    gap: 10px;
    min-height: 38px;
  }
  .library__grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 18px 12px;
  }
}
</style>
