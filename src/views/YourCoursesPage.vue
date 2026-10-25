<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { RotateCw } from '@lucide/vue';
import SelectButton from 'primevue/selectbutton';

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
          <RotateCw :size="16" />
        </button>
      </div>
      <!-- allow-empty: повторный клик по выбранному семестру не снимает выбор -->
      <SelectButton
        v-else
        v-model="filter"
        class="courses-page__filters"
        :options="filters"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Семестр"
      />
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
        <RouterLink
          v-for="course in courses"
          :key="course.id"
          class="courses-page__link"
          :to="{ name: 'course-labs', params: { courseId: course.id } }"
        >
          <CourseCard
            :course="course"
            :role="role"
          />
        </RouterLink>
      </section>
    </template>
  </main>
</template>

<style scoped>
.courses-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
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
  align-self: flex-start;
}

.courses-page__status {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  width: 2rem;
  height: 2rem;
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
  padding: 1.5rem 1.375rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.courses-page__list {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
  grid-auto-rows: 1fr;
}

.courses-page__link {
  border-radius: 1rem;
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.courses-page__link:hover {
  transform: translateY(-0.125rem);
}

.courses-page__link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}
</style>
