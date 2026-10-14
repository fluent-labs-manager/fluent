<script setup lang="ts">
import { computed } from 'vue';

import { LabStatus } from '@/types/LabStatus.ts';

const props = defineProps<{
  status: LabStatus;
}>();

const labels: Record<LabStatus, string> = {
  [LabStatus.Submitted]: 'Сдано',
  [LabStatus.PendingReview]: 'На проверке',
  [LabStatus.NotSubmitted]: 'Не сдано',
  [LabStatus.Locked]: 'Недоступно',
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
  padding: 0.25em 0.75em;
  border-radius: 1em;
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.lab-status-badge--submitted {
  background-color: var(--color-success-surface);
  color: var(--color-success-text);
}

.lab-status-badge--pending-review {
  background-color: var(--color-review-surface);
  color: var(--color-review);
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
