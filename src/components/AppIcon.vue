<script setup lang="ts">
import { computed } from 'vue';

import type { IconName } from '@/types/IconName.ts';

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
  }>(),
  { size: 20 },
);

const paths: Record<IconName, string[]> = {
  'graduation-cap': [
    'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
    'M22 10v6',
    'M6 12.5V16a6 3 0 0 0 12 0v-3.5',
  ],
  calendar: [
    'M8 2v4',
    'M16 2v4',
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M3 10h18',
  ],
};

const iconPaths = computed<string[]>(() => paths[props.name]);
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-for="d in iconPaths"
      :key="d"
      :d="d"
    />
  </svg>
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
