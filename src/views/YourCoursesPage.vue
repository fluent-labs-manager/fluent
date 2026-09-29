<script setup lang="ts">
import { computed, ref } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import CourseCard from '@/components/CourseCard.vue';
import SemesterProgress from '@/components/SemesterProgress.vue';
import { useSemesters } from '@/composables/useSemesters.ts';
import { useUserStore } from '@/stores/user.ts';
import type { Course } from '@/api/courses/Course.dto.ts';
import type { Semester } from '@/api/semesters/Semester.dto.ts';
import type { SemesterFilter } from '@/types/SemesterFilter.ts';
import type { SemesterFilterOption } from '@/types/SemesterFilterOption.ts';
import type { UserRole } from '@/types/UserRole.ts';

const filter = ref<SemesterFilter>('current');
const {
  semesters,
  isLoading: areSemestersLoading,
  error: semestersError,
  reload: reloadSemesters,
} = useSemesters();
const userStore = useUserStore();
void userStore.loadUser();

const isLoading = computed<boolean>(
  () => areSemestersLoading.value || userStore.isLoading,
);

const error = computed<string | null>(
  () => semestersError.value ?? userStore.error,
);

const role = computed<UserRole | null>(() => userStore.user?.role ?? null);

const currentSemester = computed<Semester | undefined>(() =>
  semesters.value.find((semester) => semester.isCurrent),
);

const filters = computed<SemesterFilterOption[]>(() => [
  {
    value: 'current',
    label: currentSemester.value?.title ?? 'Текущий семестр',
  },
  { value: 'all', label: 'Все семестры' },
]);

const courses = computed<Course[]>(() =>
  filter.value === 'current'
    ? (currentSemester.value?.courses ?? [])
    : semesters.value.flatMap((semester) => semester.courses),
);

function retry(): void {
  void reloadSemesters();
  void userStore.loadUser();
}
</script>

<template>
  <main class="courses-page">
    <header class="courses-page__header">
      <h1 class="courses-page__title">Дисциплины</h1>
      <p
        v-if="isLoading"
        class="courses-page__status"
        role="status"
      >
        Загрузка дисциплин…
      </p>

      <div
        v-else-if="error !== null"
        class="courses-page__status courses-page__status--error"
        role="alert"
      >
        <span>Не удалось загрузить дисциплины: {{ error }}</span>
        <button
          class="courses-page__retry"
          type="button"
          aria-label="Повторить"
          title="Повторить"
          @click="retry"
        >
          <AppIcon
            name="refresh"
            :size="16"
          />
        </button>
      </div>
      <div
        v-else
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

    <template v-if="!isLoading && error === null && role !== null">
      <SemesterProgress
        v-if="
          filter === 'current' &&
          currentSemester !== undefined &&
          currentSemester.courses.length > 0
        "
        :semester="currentSemester"
      />

      <p
        v-if="courses.length === 0"
        class="courses-page__empty"
      >
        Дисциплин пока нет.
      </p>

      <section
        v-else
        class="courses-page__list"
      >
        <CourseCard
          v-for="course in courses"
          :key="course.id"
          :course="course"
          :role="role"
        />
      </section>
    </template>
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

.courses-page__status {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: var(--nav-item-height);
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.courses-page__status--error {
  color: var(--color-error);
}

.courses-page__retry {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.courses-page__retry:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.courses-page__empty {
  margin: 0;
  padding: 24px 22px;
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.courses-page__list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 1fr;
}
</style>
