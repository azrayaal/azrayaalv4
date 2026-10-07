<script setup lang="ts">
/** Notifications: availability, recently added projects, and the resume. */
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { experiences, formatMonth, profile, projectsByYear } from '@/data';
import { useNav } from '@/composables/useNav';
import { useListFocus } from './useListFocus';

const { open } = useNav();

const items = [
  {
    id: 'availability',
    icon: 'Radio',
    title: profile.available ? 'Azra is online' : 'Azra is away',
    body: profile.availability,
    when: 'Now',
    to: '/messages',
  },
  {
    id: 'job',
    icon: 'Briefcase',
    title: `Now at ${experiences[0].company}`,
    body: experiences[0].role,
    when: formatMonth(experiences[0].startDate),
    to: '/profile?tab=career',
  },
  ...projectsByYear.slice(0, 5).map((p) => ({
    id: p.slug,
    icon: 'Gamepad2',
    title: `${p.title} added to Library`,
    body: p.shortDescription,
    when: p.year,
    to: `/project/${p.slug}`,
  })),
  {
    id: 'resume',
    icon: 'FileText',
    title: 'Resume available',
    body: 'Download the latest CV as a PDF.',
    when: 'PDF',
    href: profile.resumeUrl,
  },
];

const { index, pick } = useListFocus(
  () => items.length,
  (i) => open(items[i]),
);
</script>

<template>
  <ScreenShell title="Notifications" icon="Bell">
    <ul ref="list" class="notes scroll-area">
      <li v-for="(n, i) in items" :key="n.id">
        <button
          type="button"
          class="note focusable"
          :class="{ 'is-focused': i === index }"
          :data-focus-key="`i:${i}`"
          @click="pick(i)"
        >
          <span class="note__icon"><Icon :name="n.icon" :size="24" /></span>
          <span class="note__text">
            <strong>{{ n.title }}</strong>
            <span>{{ n.body }}</span>
          </span>
          <span class="note__when">{{ n.when }}</span>
        </button>
      </li>
    </ul>
  </ScreenShell>
</template>

<style scoped>
.notes {
  display: grid;
  align-content: start;
  gap: 10px;
  height: 100%;
  max-width: 860px;
  margin: 0;
  padding: 4px;
  list-style: none;
}
.note {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 4px;
  background: var(--panel);
  border: 1px solid var(--line);
  text-align: left;
}
.note:hover {
  background: rgba(255, 255, 255, 0.12);
}
.note__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent);
}
.note__text {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.note__text strong {
  font-size: 17px;
  font-weight: 600;
}
.note__text span {
  color: var(--text-dim);
  font-size: 15px;
}
.note__when {
  font-size: 14px;
  color: var(--text-faint);
  white-space: nowrap;
}
</style>
