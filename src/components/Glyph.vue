<script setup lang="ts">
/** Face-button glyphs: ✕ blue, ○ red, △ green, □ pink — plus the Options pill. */
defineProps<{ button: 'cross' | 'circle' | 'triangle' | 'square' | 'options' | 'dpad' }>();
</script>

<template>
  <span class="glyph" :class="`glyph--${button}`" aria-hidden="true">
    <svg v-if="button === 'cross'" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" /></svg>
    <svg v-else-if="button === 'circle'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5" /></svg>
    <svg v-else-if="button === 'triangle'" viewBox="0 0 24 24"><path d="M12 6.5l6 10.5H6z" /></svg>
    <svg v-else-if="button === 'square'" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" /></svg>
    <svg v-else-if="button === 'dpad'" viewBox="0 0 24 24">
      <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />
    </svg>
    <span v-else class="glyph__pill">OPTIONS</span>
  </span>
</template>

<style scoped>
.glyph {
  display: inline-grid;
  place-items: center;
  width: 1.6em;
  height: 1.6em;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  flex: none;
}
.glyph svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.glyph--cross svg { stroke: #2c6fe0; }
.glyph--circle svg { stroke: #e2333e; }
.glyph--triangle svg { stroke: #1aa587; }
.glyph--square svg { stroke: #d35ca8; }
.glyph--dpad svg { fill: #1b2a4a; stroke: none; padding: 2px; }
.glyph--options {
  width: auto;
  border-radius: 999px;
  padding: 0 0.5em;
}
.glyph__pill {
  font-size: 0.55em;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1b2a4a;
}
</style>
