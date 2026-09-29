<script setup lang="ts">
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import type { Course, UserRole } from '@/types/course.ts';
import { formatDayMonth } from '@/utils/format.ts';
import { formatPercent, getPercent } from '@/utils/progress.ts';

const props = defineProps<{
  course: Course;
  role: UserRole;
}>();

const progressLabel = computed<string>(() =>
  props.role === 'teacher'
    ? 'Проверено лабораторных'
    : 'Выполнено лабораторных',
);

const percent = computed<string>(() =>
  formatPercent(getPercent(props.course.completedLabs, props.course.totalLabs)),
);

const deadlineLabel = computed<string>(() => {
  if (props.course.nearestDeadline === null) {
    return 'Нет';
  }

  return formatDayMonth(props.course.nearestDeadline);
});
</script>

<template>
  <article class="course-card">
    <header class="course-card__header">
      <div class="course-card__heading">
        <h2
          class="course-card__title"
          :title="course.title"
        >
          {{ course.title }}
        </h2>
        <AppIcon
          class="course-card__arrow"
          name="chevron-right"
          :size="22"
        />
      </div>
      <p class="course-card__teacher">{{ course.teacher }}</p>
    </header>

    <div class="course-card__progress">
      <div class="course-card__stats">
        <span class="course-card__label">{{ progressLabel }}</span>
        <span class="course-card__value">
          {{ course.completedLabs }} из {{ course.totalLabs }} ({{ percent }})
        </span>
      </div>

      <ProgressBar
        :value="course.completedLabs"
        :max="course.totalLabs"
      />
    </div>

    <div
      v-if="course.isGradeSheetClosed"
      class="course-card__deadline course-card__deadline--completed"
    >
      Курс завершён
    </div>
    <div
      v-else
      class="course-card__deadline"
    >
      <span class="course-card__deadline-label">Ближайший дедлайн</span>
      <span class="course-card__deadline-value">{{ deadlineLabel }}</span>
    </div>
  </article>
</template>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 22px 20px 20px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.course-card__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-card__heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* название всегда в одну строку, длинное обрезается многоточием */
.course-card__title {
  min-width: 0;
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-card__arrow {
  color: var(--color-accent);
}

.course-card__teacher {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.course-card__progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-card__stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.course-card__label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.course-card__value {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  white-space: nowrap;
}

.course-card__deadline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding: 14px;
  border-radius: 10px;
  background-color: var(--color-muted-surface);
}

.course-card__deadline--completed {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.course-card__deadline-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.course-card__deadline-value {
  font-size: var(--font-size-sm);
  font-weight: 700;
  white-space: nowrap;
}
</style>
