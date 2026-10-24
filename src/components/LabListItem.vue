<script setup lang="ts">
import { computed } from 'vue';

import LabStatusBadge from '@/components/LabStatusBadge.vue';
import type { Lab } from '@/api/labs/Lab.dto.ts';
import type { DeadlineState } from '@/types/DeadlineState.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { formatDayMonth } from '@/utils/DateFormatter.ts';
import { getDeadlineState } from '@/utils/DeadlineState.ts';
import { formatGrade } from '@/utils/GradeFormatter.ts';
import { isSelectableLab } from '@/utils/LabSelection.ts';

const props = defineProps<{
  lab: Lab;
  // null, если в списке нет работы с меньшим номером
  previousLabNumber: number | null;
  // текущее время: от него зависит, близок ли срок
  now: Date;
  // работа открыта в карточке
  selected: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

// недоступную работу открыть в карточке нельзя
const isSelectable = computed<boolean>(() => isSelectableLab(props.lab));

// срок важен только для несданной работы
const deadlineState = computed<DeadlineState | null>(() =>
  props.lab.status === LabStatus.NotSubmitted
    ? getDeadlineState(props.lab.deadline, props.now)
    : null,
);

const details = computed<string>(() => {
  const { lab } = props;

  if (lab.status === LabStatus.Submitted) {
    return `Оценка ${formatGrade(lab.grade, 1)} · сдано ${formatDayMonth(lab.submittedAt)}`;
  }

  if (lab.status === LabStatus.PendingReview) {
    return `Сдано ${formatDayMonth(lab.submittedAt)} · ждёт оценки`;
  }

  if (lab.status === LabStatus.Locked) {
    return props.previousLabNumber !== null
      ? `Откроется после лабораторной №${String(props.previousLabNumber)}`
      : 'Пока недоступна';
  }

  return deadlineState.value === 'overdue'
    ? `Срок истёк ${formatDayMonth(lab.deadline)}`
    : `Дедлайн ${formatDayMonth(lab.deadline)}`;
});
</script>

<template>
  <article
    class="lab-list-item"
    :class="{
      'lab-list-item--selectable': isSelectable,
      'lab-list-item--selected': selected,
    }"
  >
    <div class="lab-list-item__info">
      <h3
        class="lab-list-item__title"
        :title="lab.title"
      >
        <button
          v-if="isSelectable"
          class="lab-list-item__select"
          type="button"
          :aria-pressed="selected"
          @click="emit('select')"
        >
          Лаб №{{ lab.number }}: {{ lab.title }}
        </button>
        <template v-else>Лаб №{{ lab.number }}: {{ lab.title }}</template>
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
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.lab-list-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

/* кнопка растянута на всю строку, поэтому выбрать работу можно кликом в любом месте */
.lab-list-item__select {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.lab-list-item__select::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  inset: 0;
}

.lab-list-item__select:focus-visible {
  outline: none;
}

.lab-list-item__select:focus-visible::after {
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}

.lab-list-item--selectable {
  transition: border-color 0.2s ease;
}

.lab-list-item--selectable:hover {
  border-color: var(--color-accent);
}

.lab-list-item--selected {
  border-color: var(--color-accent);
  background-color: var(--color-accent-surface);
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
