<script setup lang="ts">
import { computed } from 'vue';

import type { Lab } from '@/api/labs/Lab.dto.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { formatGrade } from '@/utils/GradeFormatter.ts';

const props = defineProps<{
  lab: Lab;
}>();

const labels: Record<LabStatus, string> = {
  [LabStatus.Submitted]: 'Сдано',
  [LabStatus.PendingReview]: 'На проверке',
  [LabStatus.NotSubmitted]: 'Не сдано',
  [LabStatus.Locked]: 'Недоступно',
};

// у сданной работы рядом со статусом — оценка
const label = computed<string>(() =>
  props.lab.status === LabStatus.Submitted
    ? `${labels[props.lab.status]} · оценка ${formatGrade(props.lab.grade, 1)}`
    : labels[props.lab.status],
);
</script>

<template>
  <span
    class="lab-status-bar"
    :class="`lab-status-bar--${lab.status}`"
  >
    <span
      class="lab-status-bar__dot"
      aria-hidden="true"
    />
    {{ label }}
  </span>
</template>

<style scoped>
.lab-status-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.375em 0.875em;
  border-radius: 1em;
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
}

.lab-status-bar__dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background-color: currentcolor;
}

.lab-status-bar--submitted {
  background-color: var(--color-success-surface);
  color: var(--color-success-text);
}

.lab-status-bar--pending-review {
  background-color: var(--color-review-surface);
  color: var(--color-review);
}

.lab-status-bar--not-submitted {
  background-color: var(--color-error-surface);
  color: var(--color-error);
}

.lab-status-bar--locked {
  background-color: var(--color-locked-surface);
  color: var(--color-locked);
}
</style>
