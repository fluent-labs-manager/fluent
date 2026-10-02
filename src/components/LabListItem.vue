<script setup lang="ts">
import { computed } from 'vue';

import LabStatusBadge from '@/components/LabStatusBadge.vue';
import type { Lab } from '@/api/labs/Lab.dto.ts';
import type { DeadlineState } from '@/types/DeadlineState.ts';
import { formatDayMonth } from '@/utils/DateFormatter.ts';
import { getDeadlineState } from '@/utils/DeadlineState.ts';
import { formatLabGrade } from '@/utils/GradeFormatter.ts';

const props = defineProps<{
  lab: Lab;
  // null, если в списке нет работы с меньшим номером
  previousLabNumber: number | null;
}>();

// срок важен только для несданной работы
const deadlineState = computed<DeadlineState | null>(() =>
  props.lab.status === 'not-submitted'
    ? getDeadlineState(props.lab.deadline)
    : null,
);

const details = computed<string>(() => {
  const { status, grade, submittedAt, deadline } = props.lab;

  if (status === 'submitted') {
    const parts: string[] = [];
    if (grade !== null) {
      parts.push(`Оценка ${formatLabGrade(grade)}`);
    }
    if (submittedAt !== null) {
      parts.push(`сдано ${formatDayMonth(submittedAt)}`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'Сдано';
  }

  if (status === 'locked') {
    return props.previousLabNumber !== null
      ? `Откроется после лабораторной №${String(props.previousLabNumber)}`
      : 'Пока недоступна';
  }

  return deadlineState.value === 'overdue'
    ? `Срок истёк ${formatDayMonth(deadline)}`
    : `Дедлайн ${formatDayMonth(deadline)}`;
});
</script>

<template>
  <article class="lab-list-item">
    <div class="lab-list-item__info">
      <h3
        class="lab-list-item__title"
        :title="lab.title"
      >
        Лаб №{{ lab.number }}: {{ lab.title }}
      </h3>
      <p
        class="lab-list-item__details"
        :class="{
          'lab-list-item__details--urgent':
            deadlineState !== null && deadlineState !== 'normal',
        }"
      >
        {{ details }}
      </p>
    </div>

    <LabStatusBadge :status="lab.status" />
  </article>
</template>

<style scoped>
.lab-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.lab-list-item__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.lab-list-item__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-list-item__details {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.lab-list-item__details--urgent {
  color: var(--color-error);
}
</style>
