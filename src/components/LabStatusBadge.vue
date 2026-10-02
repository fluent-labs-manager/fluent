<script setup lang="ts">
import { computed } from 'vue';

import type { LabStatus } from '@/types/LabStatus.ts';

const props = defineProps<{
  status: LabStatus;
}>();

const labels: Record<LabStatus, string> = {
  submitted: 'Сдано',
  'not-submitted': 'Не сдано',
  locked: 'Недоступно',
};

const label = computed<string>(() => labels[props.status]);
</script>

<template>
  <span
    class="lab-status-badge"
    :class="`lab-status-badge--${status}`"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.lab-status-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.lab-status-badge--submitted {
  background-color: var(--color-success-surface);
  color: var(--color-accent);
}

.lab-status-badge--not-submitted {
  background-color: var(--color-error-surface);
  color: var(--color-error);
}

.lab-status-badge--locked {
  background-color: var(--color-locked-surface);
  color: var(--color-locked);
}
</style>
