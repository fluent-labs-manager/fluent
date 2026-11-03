<script setup lang="ts">
import { computed } from 'vue';

import { Paperclip } from '@lucide/vue';

import type { LabAttempt } from '@/api/labs/LabAttempt.dto.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { formatNumericDate } from '@/utils/DateFormatter.ts';
import { formatFileSize } from '@/utils/FileFormatter.ts';

const props = defineProps<{
  attempt: LabAttempt;
}>();

const resultLabels: Record<AttemptResult, string> = {
  [AttemptResult.Rejected]: 'Отклонено',
  [AttemptResult.Pending]: 'На проверке',
  [AttemptResult.Accepted]: 'Принято',
};

const title = computed<string>(
  () =>
    `Попытка ${String(props.attempt.number)} — ${formatNumericDate(props.attempt.submittedAt)}`,
);

const resultLabel = computed<string>(() => resultLabels[props.attempt.result]);

const fileSize = computed<string>(() =>
  formatFileSize(props.attempt.file.size),
);
</script>

<template>
  <article class="lab-attempt-card">
    <div class="lab-attempt-card__header">
      <h3 class="lab-attempt-card__title">{{ title }}</h3>
      <span
        class="lab-attempt-card__result"
        :class="`lab-attempt-card__result--${attempt.result}`"
      >
        {{ resultLabel }}
      </span>
    </div>

    <p
      v-if="attempt.teacherComment !== null"
      class="lab-attempt-card__teacher-comment"
    >
      {{ attempt.teacherComment }}
    </p>

    <p
      v-if="attempt.comment !== null"
      class="lab-attempt-card__comment"
    >
      Ваш комментарий: {{ attempt.comment }}
    </p>

    <div class="lab-attempt-card__file">
      <Paperclip
        :size="14"
        aria-hidden="true"
      />
      <span
        class="lab-attempt-card__file-name"
        :title="attempt.file.name"
      >
        {{ attempt.file.name }}
      </span>
      <span class="lab-attempt-card__file-size">{{ fileSize }}</span>
    </div>
  </article>
</template>

<style scoped>
.lab-attempt-card {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.125rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
}

.lab-attempt-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.lab-attempt-card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.lab-attempt-card__result {
  flex-shrink: 0;
  padding: 0.25em 0.75em;
  border-radius: 1em;
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.lab-attempt-card__result--rejected {
  background-color: var(--color-error-surface);
  color: var(--color-error);
}

.lab-attempt-card__result--pending {
  background-color: var(--color-review-surface);
  color: var(--color-review);
}

.lab-attempt-card__result--accepted {
  background-color: var(--color-success-surface);
  color: var(--color-success-text);
}

.lab-attempt-card__teacher-comment {
  margin: 0;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  background-color: var(--color-muted-surface);
  font-size: var(--font-size-md);
}

.lab-attempt-card__comment {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.lab-attempt-card__file {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.lab-attempt-card__file-name {
  min-width: 0;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-attempt-card__file-size {
  flex-shrink: 0;
}
</style>
