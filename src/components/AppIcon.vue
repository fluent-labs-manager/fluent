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
  home: [
    'M3 10.5 12 3l9 7.5',
    'M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9',
  ],
  book: [
    'M12 7v14',
    'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  ],
  flask: [
    'M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2',
    'M8.5 2h7',
    'M7 16h10',
  ],
  award: [
    'M12 3a6 6 0 1 0 0 12 6 6 0 1 0 0-12z',
    'M15.5 14 17 22l-5-3-5 3 1.5-8',
  ],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  refresh: ['M21 12a9 9 0 1 1-2.64-6.36', 'M21 3v6h-6'],
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
    <path v-for="d in iconPaths" :key="d" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
