<script setup lang="ts">
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import type { Course } from '@/api/courses/Course.dto.ts';
import type { UserRole } from '@/types/UserRole.ts';
import { formatPercent, getPercent } from '@/utils/ProgressPercentage.ts';

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
</script>

<template>
  <article class="course-card">
    <header class="course-card__header">
      <div class="course-card__heading">
        <h2 class="course-card__title" :title="course.title">
          {{ course.title }}
        </h2>
        <AppIcon class="course-card__arrow" name="chevron-right" :size="22" />
      </div>
      <p class="course-card__teacher">{{ course.teacher }}</p>
    </header>

    <!-- прижат к низу, чтобы у карточек одной высоты прогресс стоял на одном уровне -->
    <div class="course-card__progress">
      <div class="course-card__stats">
        <span class="course-card__label">{{ progressLabel }}</span>
        <span class="course-card__value">
          {{ course.completedLabs }} из {{ course.totalLabs }} ({{ percent }})
        </span>
      </div>

      <ProgressBar :value="course.completedLabs" :max="course.totalLabs" />
    </div>
  </article>
</template>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding: 1.375rem 1.25rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.course-card__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-card__heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
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
  gap: 0.625rem;
  margin-top: auto;
}

.course-card__stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
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
</style>
