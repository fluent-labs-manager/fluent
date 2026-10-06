<script setup lang="ts">
import { computed } from 'vue';

import type { NotSubmittedLab } from '@/api/labs/Lab.dto.ts';
import type { DeadlineState } from '@/types/DeadlineState.ts';
import { formatDateTime } from '@/utils/DateFormatter.ts';
import { getDeadlineState } from '@/utils/DeadlineState.ts';

const props = defineProps<{
  lab: NotSubmittedLab;
  // текущее время: от него зависит, близок ли срок
  now: Date;
}>();

const emit = defineEmits<{
  openVariant: [];
  openTask: [];
}>();

const deadlineState = computed<DeadlineState>(() =>
  getDeadlineState(props.lab.deadline, props.now),
);

const deadline = computed<string>(() => {
  const date = formatDateTime(props.lab.deadline);
  return deadlineState.value === 'overdue'
    ? `Срок истёк ${date}`
    : `До ${date}`;
});
</script>

<template>
  <article class="active-lab-card">
    <div class="active-lab-card__meta">
      <span class="active-lab-card__number">
        Лабораторная работа {{ lab.number }}
      </span>
      <span
        class="active-lab-card__deadline"
        :class="{
          'active-lab-card__deadline--urgent': deadlineState !== 'normal',
        }"
      >
        {{ deadline }}
      </span>
    </div>

    <h3 class="active-lab-card__title">{{ lab.title }}</h3>

    <div class="active-lab-card__variant">
      <span class="active-lab-card__variant-label">Ваш выданный вариант:</span>
      <span class="active-lab-card__variant-value">{{ lab.variant }}</span>
    </div>

    <div class="active-lab-card__actions">
      <button
        class="active-lab-card__button active-lab-card__button--primary"
        type="button"
        @click="emit('openVariant')"
      >
        Получить вариант
      </button>
      <button
        class="active-lab-card__button active-lab-card__button--secondary"
        type="button"
        @click="emit('openTask')"
      >
        Открыть задание
      </button>
    </div>
  </article>
</template>

<style scoped>
.active-lab-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-summary);
  box-shadow: var(--shadow-card);
}

.active-lab-card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.active-lab-card__number {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.active-lab-card__deadline {
  color: var(--color-deadline);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.active-lab-card__deadline--urgent {
  color: var(--color-error);
}

.active-lab-card__title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1.2;
}

.active-lab-card__variant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
}

.active-lab-card__variant-label {
  font-size: var(--font-size-lg);
  font-weight: 500;
}

.active-lab-card__variant-value {
  color: var(--color-accent);
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1;
}

.active-lab-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.active-lab-card__button {
  min-width: 180px;
  height: 44px;
  padding: 0 24px;
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.active-lab-card__button--primary {
  background-color: var(--color-accent);
  color: var(--color-surface);
}

.active-lab-card__button--primary:hover {
  background-color: var(--color-text-secondary);
}

.active-lab-card__button--secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.active-lab-card__button--secondary:hover {
  border-color: var(--color-text);
}
</style>
