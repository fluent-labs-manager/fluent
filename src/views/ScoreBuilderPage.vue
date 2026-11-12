<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';

import { RotateCw } from '@lucide/vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Select from 'primevue/select';

import BarsSectionCard from '@/components/BarsSectionCard.vue';
import GradebookPreview from '@/components/GradebookPreview.vue';
import GroupPicker from '@/components/GroupPicker.vue';
import ScoreSummary from '@/components/ScoreSummary.vue';
import SpreadsheetPlaceholder from '@/components/SpreadsheetPlaceholder.vue';
import WorkPool from '@/components/WorkPool.vue';
import { useCourseGradebook } from '@/composables/useCourseGradebook.ts';
import { useScoreBuilder } from '@/composables/useScoreBuilder.ts';
import { useTaughtCourses } from '@/composables/useTaughtCourses.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import { focusWorkChip } from '@/utils/WorkChipFocus.ts';

const {
  courses,
  isLoading: areCoursesLoading,
  error: coursesError,
  reload: reloadCourses,
} = useTaughtCourses();

// дисциплину выбирают явно: по умолчанию её нет, чтобы не настроить
// ведомость не той дисциплины
const courseId = ref<number | null>(null);
const courseLabelId = useId();

const { gradebook, isLoading, error, reload } = useCourseGradebook(courseId);

const {
  poolWorks,
  sections,
  distributedScore,
  maxScore,
  isOverMaxScore,
  checkedGroups,
  admissionThreshold,
  moveWork,
  addWork,
  updateWorkScore,
  removeWork,
  setGroupChecked,
  setAdmissionThreshold,
} = useScoreBuilder(gradebook);

const workTitles = computed<string[]>(() =>
  [
    ...poolWorks.value,
    ...sections.value.flatMap((section) => section.works),
  ].map((work) => work.title),
);

const hasAnyWorks = computed<boolean>(
  () =>
    poolWorks.value.length > 0 ||
    sections.value.some((section) => section.works.length > 0),
);

const checkedGroupNames = computed<string[]>(() =>
  checkedGroups.value.map((group) => group.name),
);

// перенесённый чип рисуется заново в другом месте, и фокус пропал бы
// вместе со старым: ставим его на чип в новом месте
async function moveAndKeepFocus(
  workId: number,
  section: BarsSection | null,
): Promise<void> {
  moveWork(workId, section);
  await nextTick();
  focusWorkChip(document, workId);
}

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

      <div
        v-if="areCoursesLoading"
        class="score-builder-page__status"
        role="status"
      >
        <ProgressSpinner
          class="score-builder-page__spinner"
          stroke-width="6"
          aria-hidden="true"
        />
        Загрузка дисциплин…
      </div>

      <Message
        v-else-if="coursesError !== null"
        class="score-builder-page__error"
        severity="error"
      >
        <span>Не удалось загрузить дисциплины: {{ coursesError }}</span>
        <Button
          severity="secondary"
          variant="outlined"
          rounded
          size="small"
          aria-label="Повторить"
          title="Повторить"
          @click="retryCourses"
        >
          <template #icon>
            <RotateCw :size="16" />
          </template>
        </Button>
      </Message>

      <p
        v-else-if="courses.length === 0"
        class="score-builder-page__hint"
      >
        У вас пока нет дисциплин.
      </p>

      <template v-else>
        <div class="score-builder-page__field">
          <!-- у Select фокус получает не input, поэтому подпись связана
               через aria-labelledby, а не через for -->
          <span
            :id="courseLabelId"
            class="score-builder-page__label"
          >
            Дисциплина
          </span>
          <Select
            v-model="courseId"
            :aria-labelledby="courseLabelId"
            :options="courses"
            option-label="title"
            option-value="id"
            placeholder="Выберите дисциплину"
            fluid
          />
        </div>

        <p
          v-if="courseId === null"
          class="score-builder-page__hint"
        >
          Выберите дисциплину — после этого появятся её группы и работы.
        </p>

        <div
          v-else-if="isLoading"
          class="score-builder-page__status"
          role="status"
        >
          <ProgressSpinner
            class="score-builder-page__spinner"
            stroke-width="6"
            aria-hidden="true"
          />
          Загрузка дисциплины…
        </div>

        <Message
          v-else-if="error !== null"
          class="score-builder-page__error"
          severity="error"
        >
          <span>Не удалось загрузить дисциплину: {{ error }}</span>
          <Button
            severity="secondary"
            variant="outlined"
            rounded
            size="small"
            aria-label="Повторить"
            title="Повторить"
            @click="retry"
          >
            <template #icon>
              <RotateCw :size="16" />
            </template>
          </Button>
        </Message>

        <GroupPicker
          v-else-if="gradebook !== null"
          :groups="gradebook.groups"
          :checked-names="checkedGroupNames"
          @change="setGroupChecked"
        />
      </template>
    </section>

    <template v-if="gradebook !== null">
      <SpreadsheetPlaceholder
        title="Импорт Google-таблицы"
        action-label="Импортировать таблицу"
      />

      <WorkPool
        :works="poolWorks"
        :has-any-works="hasAnyWorks"
        :existing-titles="workTitles"
        @move="moveAndKeepFocus"
        @add="addWork"
        @update-score="updateWorkScore"
        @remove="removeWork"
      />

      <section
        class="score-builder-page__sections"
        aria-labelledby="bars-heading"
      >
        <div class="score-builder-page__sections-header">
          <h2
            id="bars-heading"
            class="score-builder-page__section-title"
          >
            Разделы БАРС
          </h2>
          <ScoreSummary
            :distributed-score="distributedScore"
            :max-score="maxScore"
            :is-over-max-score="isOverMaxScore"
            :admission-threshold="admissionThreshold"
            @update:admission-threshold="setAdmissionThreshold"
          />
        </div>
        <div class="score-builder-page__sections-grid">
          <BarsSectionCard
            v-for="summary in sections"
            :key="summary.section"
            :summary="summary"
            @move="moveAndKeepFocus"
            @update-score="updateWorkScore"
            @remove="removeWork"
          />
        </div>
      </section>

      <GradebookPreview
        :groups="checkedGroups"
        :sections="sections"
        :admission-threshold="admissionThreshold"
      />

      <SpreadsheetPlaceholder
        title="Экспорт Google-таблицы"
        action-label="Экспортировать таблицу"
        secondary-action-label="Создать вкладки по группам"
      />
    </template>
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

.score-builder-page__spinner {
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
}

/* текст ошибки и кнопка «Повторить» в одну строку, как на «Дисциплинах» */
.score-builder-page__error {
  align-self: flex-start;
}

.score-builder-page__error :deep(.p-message-text) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.score-builder-page__sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-builder-page__sections-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem 1.5rem;
}

.score-builder-page__section-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

/* разделов шесть: на широком экране в один-два ряда, на узком — по одному */
.score-builder-page__sections-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}

/* на узком экране меньше поля: области контента рядом с меню остаётся мало */
@media (width <= 960px) {
  .score-builder-page {
    padding-right: 1rem;
    padding-left: 1rem;
  }
}
</style>
