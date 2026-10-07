<script setup lang="ts">
/** Friends: every place to find Azra, listed like an online friends list. */
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { contactChannels, socialLinks } from '@/data';
import { useNav } from '@/composables/useNav';
import { useListFocus } from './useListFocus';

const { open } = useNav();

const iconFor: Record<string, string> = {
  GitHub: 'Github',
  LinkedIn: 'Linkedin',
  Email: 'Mail',
  whatsapp: 'MessageCircle',
};

const statusFor: Record<string, string> = {
  GitHub: 'Online · Pushing commits',
  LinkedIn: 'Online · Open to opportunities',
  Email: 'Online · Replies within a day',
  whatsapp: 'Online · Quick chats',
  'Based in': 'Jakarta · GMT+7',
};

const friends = [
  ...socialLinks.map((s) => ({ id: s.id, label: s.label, handle: s.handle, href: s.href, icon: iconFor[s.label] ?? 'Globe' })),
  ...contactChannels
    .filter((c) => !socialLinks.some((s) => s.href === c.href))
    .map((c) => ({ id: c.id, label: c.label, handle: c.value, href: c.href, icon: iconFor[c.label] ?? c.icon })),
];

const { index, pick } = useListFocus(
  () => friends.length,
  (i) => open(friends[i]),
);
</script>

<template>
  <ScreenShell title="Friends" icon="Users">
    <div class="friends">
      <p class="friends__count">Online ({{ friends.length }})</p>
      <ul ref="list" class="friends__list scroll-area">
        <li v-for="(f, i) in friends" :key="f.id">
          <button
            type="button"
            class="friend focusable"
            :class="{ 'is-focused': i === index }"
            :data-focus-key="`i:${i}`"
            @click="pick(i)"
          >
            <span class="friend__avatar"><Icon :name="f.icon" :size="26" /></span>
            <span class="friend__text">
              <strong>{{ f.label === 'whatsapp' ? 'WhatsApp' : f.label }}</strong>
              <span>{{ f.handle }}</span>
            </span>
            <span class="friend__status"><span class="status-dot" /> {{ statusFor[f.label] ?? 'Online' }}</span>
          </button>
        </li>
      </ul>
    </div>
  </ScreenShell>
</template>

<style scoped>
.friends {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  max-width: 820px;
}
.friends__count {
  margin: 0 0 12px;
  color: var(--text-faint);
}
.friends__list {
  display: grid;
  align-content: start;
  gap: 10px;
  margin: 0;
  padding: 4px;
  list-style: none;
}
.friend {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 4px;
  background: var(--panel);
  border: 1px solid var(--line);
  text-align: left;
}
.friend:hover {
  background: rgba(255, 255, 255, 0.12);
}
.friend__avatar {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), var(--bg-mid));
}
.friend__text {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.friend__text strong {
  font-size: 18px;
  font-weight: 600;
}
.friend__text span {
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.friend__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-dim);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .friend__status {
    display: none;
  }
}
</style>
