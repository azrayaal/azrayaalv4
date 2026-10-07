<script setup lang="ts">
/** What's New: career history told as an activity feed. */
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { education, experiences, formatMonth, profile } from '@/data';
import { useNav } from '@/composables/useNav';
import { useListFocus } from './useListFocus';

const { open } = useNav();

interface FeedItem {
  id: string;
  icon: string;
  verb: string;
  title: string;
  where: string;
  when: string;
  body: string;
  points: string[];
  chips: string[];
  href?: string;
}

const feed: FeedItem[] = [
  ...experiences.map((exp) => ({
    id: exp.id,
    icon: 'Briefcase',
    verb: exp.endDate ? 'worked as' : 'is working as',
    title: exp.role,
    where: `${exp.company} · ${exp.location} · ${exp.type}`,
    when: `${formatMonth(exp.startDate)} — ${formatMonth(exp.endDate)}`,
    body: exp.description,
    points: exp.achievements,
    chips: exp.stack,
    href: exp.companyUrl,
  })),
  ...education.map((edu) => ({
    id: edu.id,
    icon: 'GraduationCap',
    verb: 'completed',
    title: edu.degree,
    where: `${edu.institution} · ${edu.location}`,
    when: `${edu.startYear} — ${edu.endYear}`,
    body: edu.description,
    points: [],
    chips: [],
  })),
];

const { index, pick } = useListFocus(
  () => feed.length,
  (i) => open(feed[i]),
);
</script>

<template>
  <ScreenShell title="What's New" icon="Sparkles">
    <ol ref="list" class="feed scroll-area">
      <li
        v-for="(item, i) in feed"
        :key="item.id"
        class="post panel focusable"
        :class="{ 'is-focused': i === index }"
        :data-focus-key="`i:${i}`"
        @click="pick(i)"
      >
        <header class="post__head">
          <img :src="profile.avatar" alt="" class="post__avatar" />
          <p>
            <strong>{{ profile.headline }}</strong> {{ item.verb }}
            <strong>{{ item.title }}</strong>
            <span class="post__when">{{ item.when }}</span>
          </p>
          <span class="post__icon"><Icon :name="item.icon" :size="20" /></span>
        </header>
        <p class="post__where">{{ item.where }}</p>
        <p class="post__body">{{ item.body }}</p>
        <ul v-if="item.points.length" class="post__points">
          <li v-for="point in item.points" :key="point">{{ point }}</li>
        </ul>
        <div v-if="item.chips.length" class="post__chips">
          <span v-for="chip in item.chips" :key="chip" class="chip">{{ chip }}</span>
        </div>
        <p v-if="item.href" class="post__link"><Icon name="ExternalLink" :size="15" /> {{ item.href.replace(/^https?:\/\//, '') }}</p>
      </li>
    </ol>
  </ScreenShell>
</template>

<style scoped>
.feed {
  display: grid;
  gap: 16px;
  height: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 6px 8px 24px;
  list-style: none;
}
.post {
  padding: 18px 22px;
}
.post__head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.post__head p {
  flex: 1;
  margin: 0;
  font-size: 17px;
  color: var(--text-dim);
}
.post__head strong {
  color: #fff;
  font-weight: 600;
}
.post__avatar {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
}
.post__when {
  display: block;
  font-size: 14px;
  color: var(--text-faint);
}
.post__icon {
  color: var(--accent);
}
.post__where {
  margin: 14px 0 6px;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.post__body {
  margin: 0;
  line-height: 1.6;
  font-size: 16px;
}
.post__points {
  margin: 12px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 6px;
  color: var(--text-dim);
  line-height: 1.5;
}
.post__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.post__link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  color: var(--accent);
  font-size: 14px;
}
</style>
