<script setup lang="ts">
import { computed } from 'vue';

import { getPercent } from '@/utils/ProgressPercentage.ts';

const props = defineProps<{
  value: number;
  max: number;
}>();

const percent = computed<number>(() => getPercent(props.value, props.max));
</script>

<template>
  <div
    class="progress-bar"
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="progress-bar__fill"
      :style="{ width: `${String(percent)}%` }"
    ></div>
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background-color: var(--color-muted-surface);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  border-radius: 4px;
  background-color: var(--color-accent);
  transition: width 0.3s ease;
}
</style>
