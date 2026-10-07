<script setup lang="ts">
/**
 * Trophies: skills as trophies. The header carries the trophy level and tier
 * counts; categories list on the left, each one's trophies on the right.
 */
import { computed, ref, watch } from 'vue';
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { skills, trophyCounts, trophyGroups, trophyLevel, trophyTier, type TrophyTier } from '@/data';
import { useInput } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { unlock } from '@/composables/useNotify';
import { useScrollFocus } from '@/composables/useScrollFocus';
import { sfx } from '@/composables/useSound';

const { back } = useNav();

const counts = trophyCounts();
const tiers: TrophyTier[] = ['platinum', 'gold', 'silver', 'bronze'];

const group = ref(0);
const item = ref(0);
const zone = ref<'groups' | 'items'>('groups');

const current = computed(() => trophyGroups[group.value]);
const list = computed(() => [...current.value.skills].sort((a, b) => b.level - a.level));

watch(group, () => (item.value = 0));

const visited = new Set<number>([0]);
watch(group, (g) => {
  visited.add(g);
  if (visited.size === trophyGroups.length) unlock('completionist');
});

useInput((action) => {
  if (action === 'circle') {
    if (zone.value === 'items') {
      zone.value = 'groups';
      sfx.back();
    } else back();
    return;
  }

  if (zone.value === 'groups') {
    if (action === 'up' && group.value > 0) {
      group.value -= 1;
      sfx.move();
    } else if (action === 'down' && group.value < trophyGroups.length - 1) {
      group.value += 1;
      sfx.move();
    } else if (action === 'right' || action === 'cross') {
      zone.value = 'items';
      sfx.move();
    }
  } else if (action === 'up' && item.value > 0) {
    item.value -= 1;
    sfx.move();
  } else if (action === 'down' && item.value < list.value.length - 1) {
    item.value += 1;
    sfx.move();
  } else if (action === 'left') {
    zone.value = 'groups';
    sfx.move();
  }
});

const itemsEl = ref<HTMLElement | null>(null);
useScrollFocus(itemsEl, () => `${group.value}:${item.value}`);

const pickGroup = (i: number) => {
  zone.value = 'groups';
  if (i !== group.value) sfx.move();
  group.value = i;
};
</script>

<template>
  <ScreenShell
    title="Trophies"
    icon="Trophy"
    :hints="[{ button: 'cross', label: 'Enter' }, { button: 'circle', label: 'Back' }]"
  >
    <div class="trophies">
      <header class="summary panel">
        <div class="summary__level">
          <span class="summary__badge"><Icon name="Trophy" :size="28" /></span>
          <div>
            <strong>Level {{ trophyLevel.level }}</strong>
            <div class="bar"><span :style="{ width: `${trophyLevel.progress}%` }" /></div>
            <small>{{ trophyLevel.progress }}% · {{ skills.length }} trophies</small>
          </div>
        </div>
        <ul class="summary__tiers">
          <li v-for="tier in tiers" :key="tier">
            <span class="cup" :class="`cup--${tier}`"><Icon name="Trophy" :size="16" /></span>
            {{ counts[tier] }}
            <span class="sr-only">{{ tier }}</span>
          </li>
        </ul>
      </header>

      <div class="trophies__panes">
        <nav class="groups scroll-area" aria-label="Skill categories">
          <button
            v-for="(g, i) in trophyGroups"
            :key="g.category"
            type="button"
            class="group focusable"
            :class="{ 'is-current': i === group, 'is-focused': zone === 'groups' && i === group }"
            @click="pickGroup(i)"
          >
            <span class="group__name">{{ g.category }}</span>
            <span class="group__count">{{ g.skills.length }}</span>
            <span class="bar"><span :style="{ width: `${g.progress}%` }" /></span>
          </button>
        </nav>

        <ul ref="itemsEl" class="items scroll-area">
          <li
            v-for="(skill, i) in list"
            :key="skill.id"
            class="trophy focusable"
            :class="{ 'is-focused': zone === 'items' && i === item }"
            :data-focus-key="`${group}:${i}`"
            @click="zone = 'items'; item = i"
          >
            <span class="trophy__icon" :class="`cup--${trophyTier(skill)}`">
              <Icon :name="skill.icon" :size="26" />
            </span>
            <span class="trophy__text">
              <strong>{{ skill.name }}</strong>
              <span>{{ skill.description }}</span>
            </span>
            <span class="trophy__meta">
              <span class="cup" :class="`cup--${trophyTier(skill)}`"><Icon name="Trophy" :size="14" /></span>
              <span>{{ skill.level }}%</span>
              <small>{{ skill.years }}+ yrs</small>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </ScreenShell>
</template>

<style scoped>
.trophies {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 18px;
  height: 100%;
}
.summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
}
.summary__level {
  display: flex;
  align-items: center;
  gap: 16px;
}
.summary__badge {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7a5cff, #34128a);
}
.summary__level strong {
  font-size: 22px;
  font-weight: 400;
}
.summary__level small {
  color: var(--text-dim);
}
.bar {
  display: block;
  width: 220px;
  max-width: 100%;
  height: 4px;
  margin: 6px 0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #fff);
}
.summary__tiers {
  display: flex;
  gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 20px;
}
.summary__tiers li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cup {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
}
.cup--platinum { background: linear-gradient(135deg, #f4f8ff, #8796b2); color: #1b2a4a; }
.cup--gold { background: linear-gradient(135deg, #ffe48a, #b07d0e); color: #3b2a00; }
.cup--silver { background: linear-gradient(135deg, #f1f4f7, #8a96a3); color: #23303d; }
.cup--bronze { background: linear-gradient(135deg, #f0c08f, #8a4f1c); color: #2e1606; }

.trophies__panes {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 22px;
  min-height: 0;
}
.groups {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 4px;
}
.group {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 8px;
  padding: 12px 14px;
  border-radius: 4px;
  text-align: left;
  color: var(--text-dim);
}
.group .bar {
  grid-column: 1 / -1;
  width: 100%;
}
.group.is-current {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.group:hover {
  background: var(--panel-hover);
}
.group__name {
  font-size: 17px;
}
.group__count {
  font-size: 14px;
  color: var(--text-faint);
}
.items {
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 4px 6px 24px;
  list-style: none;
}
.trophy {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 4px;
  background: var(--panel);
  border: 1px solid var(--line);
  cursor: default;
}
.trophy__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 4px;
}
.trophy__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.trophy__text strong {
  font-size: 17px;
  font-weight: 600;
}
.trophy__text span {
  font-size: 14px;
  color: var(--text-dim);
}
.trophy__meta {
  display: grid;
  justify-items: end;
  gap: 2px;
  font-size: 16px;
}
.trophy__meta small {
  color: var(--text-faint);
}
.trophy__meta .cup {
  width: 22px;
  height: 22px;
}
@media (max-width: 760px) {
  .trophies {
    display: block;
    overflow-y: auto;
    height: 100%;
  }
  .summary {
    margin-bottom: 14px;
  }
  .trophies__panes {
    grid-template-columns: 1fr;
  }
  .groups {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .group {
    flex: none;
    min-width: 150px;
  }
  .items {
    overflow: visible;
  }
  .trophy {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .trophy__meta {
    grid-column: 2;
    justify-items: start;
    grid-auto-flow: column;
    justify-content: start;
    align-items: center;
    gap: 8px;
  }
}
</style>
