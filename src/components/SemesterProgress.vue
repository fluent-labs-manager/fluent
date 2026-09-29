<script setup lang="ts">
import { computed } from 'vue';

import type { Semester } from '@/api/semesters/Semester.dto.ts';
import { formatGrade } from '@/utils/GradeFormatter.ts';
import { formatPercent, getPercent } from '@/utils/ProgressPercentage.ts';

const props = defineProps<{
  semester: Semester;
}>();

const completedLabs = computed<number>(() =>
  props.semester.courses.reduce((sum, course) => sum + course.completedLabs, 0),
);

const totalLabs = computed<number>(() =>
  props.semester.courses.reduce((sum, course) => sum + course.totalLabs, 0),
);

const percent = computed<string>(() =>
  formatPercent(getPercent(completedLabs.value, totalLabs.value)),
);

const averageGrade = computed<string>(() =>
  formatGrade(props.semester.averageGrade),
);
</script>

<template>
  <section class="semester-progress">
    <div class="semester-progress__info">
      <h2 class="semester-progress__title">Прогресс семестра</h2>
      <p class="semester-progress__details">
        {{ completedLabs }} из {{ totalLabs }} лабораторных выполнены · средний
        балл {{ averageGrade }}
      </p>
    </div>
    <span class="semester-progress__percent">{{ percent }} выполнено</span>
  </section>
</template>

<style scoped>
.semester-progress {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 22px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-summary);
  box-shadow: var(--shadow-card);
}

.semester-progress__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.semester-progress__title {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.semester-progress__details {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.semester-progress__percent {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-transform: uppercase;
}
</style>
