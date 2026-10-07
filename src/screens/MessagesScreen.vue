<script setup lang="ts">
/**
 * Messages: conversations on the left, a thread and composer on the right.
 * The site is static, so sending hands the message to the visitor's own mail
 * client or WhatsApp with the text already filled in.
 */
import { computed, nextTick, onMounted, ref } from 'vue';
import Icon from '@/components/Icon.vue';
import ScreenShell from '@/components/ScreenShell.vue';
import { contactChannels, profile } from '@/data';
import { useInput } from '@/composables/useInput';
import { useNav } from '@/composables/useNav';
import { unlock } from '@/composables/useNotify';
import { sfx } from '@/composables/useSound';

const { back } = useNav();

const whatsapp = contactChannels.find((c) => c.href.includes('wa.me'));

const conversations = [
  {
    id: 'email',
    label: 'Email',
    sub: profile.email,
    icon: 'Mail',
    compose: (text: string) =>
      `mailto:${profile.email}?subject=${encodeURIComponent('Hello from your portfolio')}&body=${encodeURIComponent(text)}`,
  },
  ...(whatsapp
    ? [
        {
          id: 'whatsapp',
          label: 'WhatsApp',
          sub: whatsapp.value,
          icon: 'MessageCircle',
          compose: (text: string) => `${whatsapp.href}?text=${encodeURIComponent(text)}`,
        },
      ]
    : []),
];

interface Bubble {
  from: 'azra' | 'me' | 'system';
  text: string;
}

const intro: Bubble[] = [
  { from: 'azra', text: `Hi, I'm ${profile.headline} 👋` },
  { from: 'azra', text: profile.summary },
  { from: 'azra', text: `${profile.availability}. Drop me a message below.` },
];

const threads = ref<Record<string, Bubble[]>>(
  Object.fromEntries(conversations.map((c) => [c.id, [...intro]])),
);

const active = ref(0);
const zone = ref<'list' | 'compose'>('list');
const draft = ref('');
const input = ref<HTMLTextAreaElement | null>(null);
const thread = ref<HTMLElement | null>(null);

const conversation = computed(() => conversations[active.value]);

onMounted(() => unlock('say-hello'));

const focusComposer = async () => {
  zone.value = 'compose';
  await nextTick();
  input.value?.focus();
};

const send = async () => {
  const text = draft.value.trim();
  if (!text) {
    sfx.deny();
    return;
  }
  sfx.confirm();
  const list = threads.value[conversation.value.id];
  list.push({ from: 'me', text });
  list.push({ from: 'system', text: `Opening ${conversation.value.label} to deliver your message…` });
  window.open(conversation.value.compose(text), '_blank', 'noopener');
  draft.value = '';
  await nextTick();
  thread.value?.scrollTo({ top: thread.value.scrollHeight, behavior: 'smooth' });
};

useInput((action) => {
  if (zone.value === 'compose') {
    if (action === 'circle' || action === 'left') {
      input.value?.blur();
      zone.value = 'list';
      sfx.back();
    } else if (action === 'cross') void send();
    return;
  }
  if (action === 'circle') return back();
  if (action === 'up' && active.value > 0) {
    active.value -= 1;
    sfx.move();
  } else if (action === 'down' && active.value < conversations.length - 1) {
    active.value += 1;
    sfx.move();
  } else if (action === 'right' || action === 'cross') {
    sfx.move();
    void focusComposer();
  }
});

const pick = (i: number) => {
  if (i !== active.value) sfx.move();
  active.value = i;
  zone.value = 'list';
};
</script>

<template>
  <ScreenShell
    title="Messages"
    icon="MessageSquare"
    :hints="zone === 'compose'
      ? [{ button: 'cross', label: 'Send' }, { button: 'circle', label: 'Back' }]
      : [{ button: 'cross', label: 'Write' }, { button: 'circle', label: 'Back' }]"
  >
    <div class="messages">
      <ul class="convos">
        <li v-for="(c, i) in conversations" :key="c.id">
          <button
            type="button"
            class="convo focusable"
            :class="{ 'is-current': i === active, 'is-focused': zone === 'list' && i === active }"
            @click="pick(i)"
          >
            <img :src="profile.avatar" alt="" class="convo__avatar" />
            <span class="convo__text">
              <strong>{{ profile.headline }}</strong>
              <span><Icon :name="c.icon" :size="14" /> {{ c.label }} · {{ c.sub }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div class="chat panel">
        <header class="chat__head">
          <Icon :name="conversation.icon" :size="20" />
          {{ profile.headline }} · {{ conversation.label }}
        </header>
        <div ref="thread" class="chat__thread scroll-area">
          <p
            v-for="(bubble, i) in threads[conversation.id]"
            :key="i"
            class="bubble"
            :class="`bubble--${bubble.from}`"
          >
            {{ bubble.text }}
          </p>
        </div>
        <form class="chat__composer" :class="{ 'is-focused': zone === 'compose' }" @submit.prevent="send">
          <label class="sr-only" for="composer">Message</label>
          <textarea
            id="composer"
            ref="input"
            v-model="draft"
            rows="2"
            :placeholder="`Write a message to ${profile.headline}…`"
            @focus="zone = 'compose'"
            @blur="zone = 'list'"
            @keydown.enter.exact.prevent="send"
          />
          <button type="submit" class="chat__send" aria-label="Send">
            <Icon name="Send" :size="20" />
          </button>
        </form>
      </div>
    </div>
  </ScreenShell>
</template>

<style scoped>
.messages {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  height: 100%;
}
.convos {
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 4px;
  list-style: none;
}
.convo {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  text-align: left;
}
.convo.is-current {
  background: rgba(255, 255, 255, 0.12);
}
.convo:hover {
  background: var(--panel-hover);
}
.convo__avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  flex: none;
}
.convo__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.convo__text span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  overflow: hidden;
}
.chat__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  color: var(--text-dim);
}
.chat__thread {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
}
.bubble {
  max-width: min(560px, 85%);
  margin: 0;
  padding: 10px 14px;
  border-radius: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.bubble--azra {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.12);
  border-bottom-left-radius: 4px;
}
.bubble--me {
  align-self: flex-end;
  background: var(--accent);
  color: #06142e;
  border-bottom-right-radius: 4px;
}
.bubble--system {
  align-self: center;
  font-size: 13px;
  color: var(--text-faint);
  background: none;
}
.chat__composer {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin: 12px;
  padding: 8px 8px 8px 14px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--line);
  transition: box-shadow 0.2s;
}
.chat__composer.is-focused {
  box-shadow: var(--focus-ring);
}
textarea {
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: none;
  color: #fff;
  font: inherit;
  font-size: 16px;
  line-height: 1.5;
}
textarea::placeholder {
  color: var(--text-faint);
}
.chat__send {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.14);
}
.chat__send:hover {
  background: rgba(255, 255, 255, 0.24);
}
@media (max-width: 760px) {
  .messages {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
  }
  .convos {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .convo {
    width: auto;
    flex: none;
  }
  .convo__text strong {
    display: none;
  }
}
</style>
