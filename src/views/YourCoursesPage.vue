<script setup lang="ts">
import { computed, ref } from 'vue';

import CourseCard from '@/components/CourseCard.vue';
import SemesterProgress from '@/components/SemesterProgress.vue';
import { currentSemester, pastSemesters } from '@/mocks/courses.ts';
import { currentUser } from '@/mocks/user.ts';
import type { Course } from '@/types/course.ts';

type SemesterFilter = 'current' | 'all';

const filter = ref<SemesterFilter>('current');

const filters: { value: SemesterFilter; label: string }[] = [
  { value: 'current', label: currentSemester.title },
  { value: 'all', label: 'Все семестры' },
];

const courses = computed<Course[]>(() =>
  filter.value === 'current'
    ? currentSemester.courses
    : [currentSemester, ...pastSemesters].flatMap(
        (semester) => semester.courses,
      ),
);
</script>

<template>
  <main class="courses-page">
    <header class="courses-page__header">
      <h1 class="courses-page__title">Дисциплины</h1>

      <div
        class="courses-page__filters"
        role="group"
        aria-label="Семестр"
      >
        <button
          v-for="item in filters"
          :key="item.value"
          class="courses-page__filter"
          :class="{ 'courses-page__filter--active': filter === item.value }"
          type="button"
          :aria-pressed="filter === item.value"
          @click="filter = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <SemesterProgress
      v-if="filter === 'current'"
      :semester="currentSemester"
    />

    <section class="courses-page__list">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :role="currentUser.role"
      />
    </section>
  </main>
</template>

<style scoped>
.courses-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: var(--page-offset-top) 40px 40px;
}

.courses-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--page-header-gap);
}

.courses-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

/* сегментированный переключатель: выбранная вкладка «поднята» белой плашкой */
.courses-page__filters {
  display: flex;
  align-self: flex-start;
  gap: 4px;
  height: var(--nav-item-height);
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-accent-surface);
}

.courses-page__filter {
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.courses-page__filter:hover {
  color: var(--color-text);
}

.courses-page__filter--active {
  background-color: var(--color-surface);
  color: var(--color-text);
  font-weight: 700;
  box-shadow: var(--shadow-raised);
}

.courses-page__list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 1fr;
}
</style>
