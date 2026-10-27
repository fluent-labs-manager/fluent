<script setup lang="ts">
import { computed, ref } from 'vue';

import { RotateCw } from '@lucide/vue';

import GroupPicker from '@/components/GroupPicker.vue';
import { useCourseGradebook } from '@/composables/useCourseGradebook.ts';
import { useScoreBuilder } from '@/composables/useScoreBuilder.ts';
import { useTaughtCourses } from '@/composables/useTaughtCourses.ts';

const {
  courses,
  isLoading: areCoursesLoading,
  error: coursesError,
  reload: reloadCourses,
} = useTaughtCourses();

// дисциплину выбирают явно: по умолчанию её нет, чтобы не настроить
// ведомость не той дисциплины
const courseId = ref<number | null>(null);

const { gradebook, isLoading, error, reload } = useCourseGradebook(courseId);

const { checkedGroups, setGroupChecked } = useScoreBuilder(gradebook);

const checkedGroupNames = computed<string[]>(() =>
  checkedGroups.value.map((group) => group.name),
);

function retryCourses(): void {
  void reloadCourses();
}

function retry(): void {
  void reload();
}
</script>

<template>
  <main class="score-builder-page">
    <h1 class="score-builder-page__title">Конструктор баллов</h1>

    <section
      class="score-builder-page__card"
      aria-labelledby="course-heading"
    >
      <h2
        id="course-heading"
        class="score-builder-page__card-title"
      >
        Дисциплина и группы
      </h2>

      <p
        v-if="areCoursesLoading"
        class="score-builder-page__status"
        role="status"
      >
        Загрузка дисциплин…
      </p>

      <div
        v-else-if="coursesError !== null"
        class="score-builder-page__status score-builder-page__status--error"
        role="alert"
      >
        <span>Не удалось загрузить дисциплины: {{ coursesError }}</span>
        <button
          class="score-builder-page__retry"
          type="button"
          aria-label="Повторить"
          title="Повторить"
          @click="retryCourses"
        >
          <RotateCw :size="16" />
        </button>
      </div>

      <p
        v-else-if="courses.length === 0"
        class="score-builder-page__hint"
      >
        У вас пока нет дисциплин.
      </p>

      <template v-else>
        <!-- подпись связана через for: если обернуть ею список, браузер
             добавит к имени списка текст всех пунктов -->
        <div class="score-builder-page__field">
          <label
            class="score-builder-page__label"
            for="score-builder-course"
          >
            Дисциплина
          </label>
          <select
            id="score-builder-course"
            v-model="courseId"
            class="score-builder-page__select"
          >
            <option
              :value="null"
              disabled
            >
              Выберите дисциплину
            </option>
            <option
              v-for="course in courses"
              :key="course.id"
              :value="course.id"
            >
              {{ course.title }}
            </option>
          </select>
        </div>

        <p
          v-if="courseId === null"
          class="score-builder-page__hint"
        >
          Выберите дисциплину — после этого появятся её группы и работы.
        </p>

        <p
          v-else-if="isLoading"
          class="score-builder-page__status"
          role="status"
        >
          Загрузка дисциплины…
        </p>

        <div
          v-else-if="error !== null"
          class="score-builder-page__status score-builder-page__status--error"
          role="alert"
        >
          <span>Не удалось загрузить дисциплину: {{ error }}</span>
          <button
            class="score-builder-page__retry"
            type="button"
            aria-label="Повторить"
            title="Повторить"
            @click="retry"
          >
            <RotateCw :size="16" />
          </button>
        </div>

        <GroupPicker
          v-else-if="gradebook !== null"
          :groups="gradebook.groups"
          :checked-names="checkedGroupNames"
          @change="setGroupChecked"
        />
      </template>
    </section>
  </main>
</template>

<style scoped>
.score-builder-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.score-builder-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.score-builder-page__card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.score-builder-page__card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.score-builder-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 30rem;
}

.score-builder-page__label {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.score-builder-page__select {
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-md);
  cursor: pointer;
}

.score-builder-page__select:focus {
  border-color: var(--color-accent);
  outline: none;
}

.score-builder-page__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.score-builder-page__status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.score-builder-page__status--error {
  color: var(--color-error);
}

.score-builder-page__retry {
  display: flex;
  flex-shrink: 0;
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

.score-builder-page__retry:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>
