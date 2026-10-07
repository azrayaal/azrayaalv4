<script setup lang="ts">
/** Profile: cover banner, avatar and online ID, with About / Career / Stats / Education tabs. */
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import type { Hint } from '@/components/HintBar.vue';
import { education, experiences, formatMonth, profile, skills, trophyLevel } from '@/data';
import { useInput } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { useScrollFocus } from '@/composables/useScrollFocus';
import { sfx } from '@/composables/useSound';

const { open, back, router } = useNav();
const route = useRoute();

const actions = [
  { id: 'msg', label: 'Send message', icon: 'MessageSquare', to: '/messages' },
  { id: 'cv', label: 'Resume', icon: 'Download', href: profile.resumeUrl },
  { id: 'friends', label: 'Friends', icon: 'Users', to: '/friends' },
  { id: 'trophies', label: 'Trophies', icon: 'Trophy', to: '/trophies' },
];
const tabs = [
  { id: 'about', label: 'About', icon: 'UserRound' },
  { id: 'career', label: 'Career', icon: 'Briefcase', count: experiences.length },
  { id: 'stats', label: 'Stats', icon: 'BarChart3' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', count: education.length },
];
const CAREER = 1;

// The open tab lives in the URL (?tab=career) so it can be linked to directly
// and survives a round trip to another screen.
const tabFromQuery = () => Math.max(0, tabs.findIndex((t) => t.id === route.query.tab));

// Rows: 0 = action buttons, 1 = tabs, 2 = career entries (Career tab only).
const row = ref<0 | 1 | 2>(1);
const action = ref(0);
const tab = ref(tabFromQuery());
const job = ref(0);
const current = experiences.find((exp) => !exp.endDate) ?? experiences[0];

const duration = (start: string, end: string | null) => {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date();
  const months = Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth());
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? 's' : ''}`, rest && `${rest} mo${rest > 1 ? 's' : ''}`]
    .filter(Boolean)
    .join(' ');
};

const career = computed(() =>
  experiences.map((exp) => ({
    ...exp,
    period: `${formatMonth(exp.startDate)} — ${formatMonth(exp.endDate)}`,
    length: duration(exp.startDate, exp.endDate),
  })),
);

const openJob = (i: number) => open({ href: career.value[i].companyUrl });

const body = ref<HTMLElement | null>(null);
const tabsEl = ref<HTMLElement | null>(null);
useScrollFocus(body, () => (row.value === 2 ? `2:${job.value}` : row.value === 1 ? 'tabs' : 'actions'));

watch(tab, async (index) => {
  void router.replace({ query: index === 0 ? {} : { tab: tabs[index].id } });
  // A new tab starts at its top: if the reader had scrolled past the tab bar,
  // bring the bar back to the top instead of landing mid-content.
  await nextTick();
  const scroller = body.value;
  const bar = tabsEl.value;
  if (scroller && bar && scroller.scrollTop > bar.offsetTop) {
    scroller.scrollTo({ top: bar.offsetTop, behavior: 'smooth' });
  }
});

watch(
  () => route.query.tab,
  () => (tab.value = tabFromQuery()),
);

const showCareer = () => {
  sfx.confirm();
  tab.value = CAREER;
  row.value = 1;
  void nextTick(() => {
    const bar = tabsEl.value;
    if (bar) body.value?.scrollTo({ top: bar.offsetTop, behavior: 'smooth' });
  });
};

const hints = computed<Hint[]>(() => {
  if (row.value === 2) {
    return [
      { button: 'cross', label: career.value[job.value]?.companyUrl ? 'Open website' : 'Select' },
      { button: 'circle', label: 'Tabs' },
    ];
  }
  if (row.value === 1 && tab.value === CAREER) {
    return [
      { button: 'cross', label: 'Browse career' },
      { button: 'circle', label: 'Back' },
    ];
  }
  return [
    { button: 'cross', label: 'Enter' },
    { button: 'circle', label: 'Back' },
  ];
});


useInput((input) => {
  if (input === 'circle') {
    if (row.value === 2) {
      row.value = 1;
      sfx.back();
      return;
    }
    return back();
  }

  if (row.value === 2) {
    if (input === 'up') {
      if (job.value > 0) job.value -= 1;
      else row.value = 1;
      sfx.move();
    } else if (input === 'down' && job.value < career.value.length - 1) {
      job.value += 1;
      sfx.move();
    } else if (input === 'cross') openJob(job.value);
    return;
  }

  const index = row.value === 0 ? action : tab;
  const length = row.value === 0 ? actions.length : tabs.length;
  if (input === 'left' && index.value > 0) {
    index.value -= 1;
    sfx.move();
  } else if (input === 'right' && index.value < length - 1) {
    index.value += 1;
    sfx.move();
  } else if (input === 'up' && row.value === 1) {
    row.value = 0;
    sfx.move();
  } else if (input === 'down' && row.value === 0) {
    row.value = 1;
    sfx.move();
  } else if (input === 'down' && row.value === 1 && tab.value === CAREER) {
    row.value = 2;
    job.value = 0;
    sfx.move();
  } else if (input === 'cross' && row.value === 1 && tab.value === CAREER) {
    row.value = 2;
    job.value = 0;
    sfx.move();
  } else if (input === 'cross' && row.value === 0) open(actions[action.value]);
});

const pickJob = (i: number) => {
  row.value = 2;
  job.value = i;
  openJob(i);
};

const pickTab = (i: number) => {
  row.value = 1;
  if (i !== tab.value) sfx.move();
  tab.value = i;
};
</script>

<template>
  <ScreenShell title="Profile" icon="UserRound" :hints="hints">
    <div ref="body" class="profile scroll-area">
      <div class="banner"><span>{{ profile.tagline }}</span></div>

      <div class="id">
        <img :src="profile.avatar" alt="" class="id__avatar" />
        <div class="id__text">
          <h2>{{ profile.headline }}</h2>
          <p class="id__online">
            <span class="status-dot" /> {{ profile.name }} · {{ profile.title }}
          </p>
          <p class="id__where"><Icon name="MapPin" :size="16" /> {{ profile.location }} · {{ profile.timezone }}</p>
          <button type="button" class="id__now" @click="showCareer">
            <Icon name="Briefcase" :size="16" />
            <span>Currently <strong>{{ current.role }}</strong> at <strong>{{ current.company }}</strong></span>
            <span class="id__now-link">View career <Icon name="ChevronRight" :size="16" /></span>
          </button>
        </div>
        <div class="id__level">
          <Icon name="Trophy" :size="20" /> Level {{ trophyLevel.level }}
          <small>{{ skills.length }} trophies</small>
        </div>
      </div>

      <div class="actions" data-focus-key="actions">
        <button
          v-for="(a, i) in actions"
          :key="a.id"
          type="button"
          class="actions__btn focusable"
          :class="{ 'is-focused': row === 0 && i === action }"
          @click="row = 0; action = i; open(a)"
        >
          <Icon :name="a.icon" :size="18" /> {{ a.label }}
        </button>
      </div>

      <div ref="tabsEl" class="tabs" role="tablist" data-focus-key="tabs">
        <button
          v-for="(t, i) in tabs"
          :key="t.id"
          type="button"
          role="tab"
          class="tabs__tab focusable"
          :aria-selected="i === tab"
          :class="{ 'is-current': i === tab, 'is-focused': row === 1 && i === tab }"
          @click="pickTab(i)"
        >
          <Icon :name="t.icon" :size="18" />
          {{ t.label }}
          <span v-if="t.count" class="tabs__count">{{ t.count }}</span>
        </button>
      </div>

      <div class="tab-body">
        <div v-if="tab === 0" class="about panel">
          <p class="about__summary">{{ profile.summary }}</p>
          <p v-for="(para, i) in profile.bio" :key="i">{{ para }}</p>
          <p class="about__avail"><span class="status-dot" /> {{ profile.availability }}</p>
        </div>

        <ol v-else-if="tab === CAREER" class="career">
          <li
            v-for="(exp, i) in career"
            :key="exp.id"
            class="job panel focusable"
            :class="{ 'is-focused': row === 2 && i === job, 'job--linked': exp.companyUrl }"
            :data-focus-key="`2:${i}`"
            @click="pickJob(i)"
          >
            <span class="job__dot" :class="{ 'job__dot--now': !exp.endDate }" />
            <header class="job__head">
              <span class="job__logo"><Icon name="Briefcase" :size="22" /></span>
              <div class="job__title">
                <h3>{{ exp.role }}</h3>
                <p>
                  {{ exp.company }}
                  <Icon v-if="exp.companyUrl" name="ExternalLink" :size="14" />
                </p>
              </div>
              <div class="job__when">
                <span>{{ exp.period }}</span>
                <small>{{ exp.length }} · {{ exp.type }}</small>
              </div>
            </header>
            <p class="job__where"><Icon name="MapPin" :size="14" /> {{ exp.location }}</p>
            <p class="job__desc">{{ exp.description }}</p>
            <ul class="job__points">
              <li v-for="point in exp.achievements" :key="point">{{ point }}</li>
            </ul>
            <div class="job__chips">
              <span v-for="tech in exp.stack" :key="tech" class="chip">{{ tech }}</span>
            </div>
          </li>
        </ol>

        <div v-else-if="tab === 2" class="stats">
          <div v-for="stat in profile.statistics" :key="stat.id" class="stat panel">
            <strong>{{ stat.value }}{{ stat.suffix }}</strong>
            <span>{{ stat.label }}</span>
            <small>{{ stat.description }}</small>
          </div>
          <div class="stat panel">
            <strong>{{ experiences.length }}</strong>
            <span>Companies</span>
            <small>{{ experiences.map((e) => e.company).join(' · ') }}</small>
          </div>
        </div>

        <div v-else class="edu">
          <article v-for="edu in education" :key="edu.id" class="panel edu__item">
            <span class="edu__icon"><Icon name="GraduationCap" :size="24" /></span>
            <div>
              <h3>{{ edu.degree }}</h3>
              <p class="edu__where">{{ edu.institution }} · {{ edu.startYear }}–{{ edu.endYear }}</p>
              <p>{{ edu.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </ScreenShell>
</template>

<style scoped>
.profile {
  height: 100%;
  margin: -6px;
  padding: 6px 6px 24px;
}
.banner {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  height: clamp(110px, 22vh, 190px);
  padding: 20px 24px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--line);
  background:
    radial-gradient(60% 120% at 85% 0%, rgba(var(--wave), 0.45), transparent 70%),
    repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 14px),
    linear-gradient(120deg, var(--bg-top), var(--bg-bottom));
}
.banner span {
  max-width: 60%;
  font-size: clamp(16px, 2vw, 24px);
  font-weight: 300;
  font-style: italic;
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
}
.id {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
  margin: -54px 0 0 24px;
  position: relative;
}
.id__avatar {
  width: 128px;
  height: 128px;
  border-radius: 6px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4);
}
.id__text,
.id__level {
  margin-top: 62px;
}
.id__text h2 {
  margin: 0;
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 300;
}
.id__text p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 0;
  color: var(--text-dim);
}
.id__level {
  margin-left: auto;
  margin-right: 8px;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 2px 8px;
  font-size: 18px;
}
.id__level small {
  grid-column: 2;
  color: var(--text-faint);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 24px 0 18px;
}
.actions__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 4px;
  background: var(--panel-strong);
  border: 1px solid var(--line);
}
.actions__btn:hover {
  background: rgba(255, 255, 255, 0.16);
}
/* Sticky so the tabs stay one press away while scrolling a long tab. */
.tabs {
  position: sticky;
  top: -6px; /* the scroller's own top padding */
  z-index: 3;
  display: flex;
  gap: 6px;
  margin: 0 -6px 16px;
  padding: 6px 6px 0;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-mid) 96%, #000);
  box-shadow: 0 8px 18px -10px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  display: none;
}
.tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 4px 4px 0 0;
  font-size: 17px;
  color: var(--text-dim);
  border-bottom: 2px solid transparent;
}
.tabs__tab:hover {
  color: #fff;
  background: var(--panel-hover);
}
.tabs__tab.is-current {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: var(--accent);
}
.tabs__count {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 13px;
  line-height: 20px;
  text-align: center;
}
.id__now {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--line);
  text-align: left;
  font-size: 15px;
  color: var(--text-dim);
}
.id__now strong {
  color: #fff;
  font-weight: 600;
}
.id__now-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--accent);
}
.id__now:hover {
  background: rgba(255, 255, 255, 0.16);
}
.panel {
  padding: 20px 22px;
}
.about {
  max-width: 900px;
  line-height: 1.65;
  font-size: 17px;
}
.about p {
  margin: 0 0 12px;
  color: var(--text-dim);
}
.about .about__summary {
  color: #fff;
  font-size: 19px;
  font-weight: 300;
}
.about .about__avail {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 0;
  color: #fff;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.stat {
  display: grid;
  gap: 4px;
}
.stat strong {
  font-size: 40px;
  font-weight: 300;
  line-height: 1;
}
.stat span {
  font-size: 16px;
}
.stat small {
  color: var(--text-dim);
  font-size: 14px;
}
.career {
  position: relative;
  display: grid;
  gap: 14px;
  max-width: 980px;
  margin: 0;
  padding: 4px 4px 4px 26px;
  list-style: none;
}
.career::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 18px;
  bottom: 18px;
  width: 2px;
  background: linear-gradient(var(--accent), rgba(255, 255, 255, 0.08));
}
.job {
  position: relative;
  padding: 18px 22px;
}
.job--linked {
  cursor: pointer;
}
.job--linked:hover {
  background: rgba(255, 255, 255, 0.1);
}
.job__dot {
  position: absolute;
  left: -23px;
  top: 30px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg-mid);
  border: 2px solid var(--accent);
}
.job__dot--now {
  background: var(--live);
  border-color: var(--live);
  box-shadow: 0 0 10px var(--live);
}
.job__head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.job__logo {
  display: grid;
  place-items: center;
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), var(--bg-mid));
}
.job__title {
  flex: 1;
  min-width: 0;
}
.job__title h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
}
.job__title p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0 0;
  color: var(--accent);
}
.job__when {
  display: grid;
  justify-items: end;
  text-align: right;
  font-size: 15px;
}
.job__when small {
  color: var(--text-faint);
  font-size: 13px;
}
.job__where {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 6px;
  font-size: 14px;
  color: var(--text-faint);
}
.job__desc {
  margin: 0;
  line-height: 1.6;
}
.job__points {
  display: grid;
  gap: 6px;
  margin: 12px 0 0;
  padding-left: 20px;
  color: var(--text-dim);
  line-height: 1.5;
}
.job__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.edu {
  display: grid;
  gap: 12px;
  max-width: 900px;
}
.edu__item {
  display: flex;
  gap: 16px;
}
.edu__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}
.edu h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.edu p {
  margin: 4px 0 0;
  color: var(--text-dim);
  line-height: 1.6;
}
.edu .edu__where {
  color: var(--text-faint);
}
@media (max-width: 640px) {
  .id {
    margin: -48px 0 0 12px;
  }
  .id__avatar {
    width: 96px;
    height: 96px;
  }
  .id__text {
    margin-top: 0;
    width: 100%;
  }
  .id__level {
    margin: 0;
  }
  .banner span {
    display: none;
  }
  .tabs {
    gap: 0;
  }
  .tabs__tab {
    gap: 6px;
    padding: 0 10px;
    font-size: 14px;
  }
  .tabs__count {
    display: none;
  }
  .id__now {
    width: 100%;
  }
  .job__head {
    flex-wrap: wrap;
  }
  .job__when {
    width: 100%;
    justify-items: start;
    text-align: left;
  }
}
</style>
