<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { ChevronLeft, RotateCw } from '@lucide/vue';

import FileDropzone from '@/components/FileDropzone.vue';
import LabAttemptCard from '@/components/LabAttemptCard.vue';
import LabStatusBar from '@/components/LabStatusBar.vue';
import SubmittedFileCard from '@/components/SubmittedFileCard.vue';
import type { LabAttempt } from '@/api/labs/LabAttempt.dto.ts';
import { useLabSubmission } from '@/composables/useLabSubmission.ts';
import { LabStatus } from '@/types/LabStatus.ts';

const props = defineProps<{
  courseId: number;
  labId: number;
}>();

const { submission, isLoading, error, reload } = useLabSubmission(
  () => props.courseId,
  () => props.labId,
);

const lab = computed(() => submission.value?.lab ?? null);

// отправить файл можно только у несданной работы, остальные — для просмотра
const canSubmit = computed<boolean>(
  () => lab.value?.status === LabStatus.NotSubmitted,
);

const latestAttempt = computed<LabAttempt | null>(() => {
  const attempts = submission.value?.attempts ?? [];
  return attempts[attempts.length - 1] ?? null;
});

// в истории сверху последняя попытка
const history = computed<LabAttempt[]>(() =>
  [...(submission.value?.attempts ?? [])].reverse(),
);

function retry(): void {
  void reload();
}
</script>

<template>
  <main class="lab-submission-page">
    <!-- возвращает к дисциплине с этой же работой в карточке -->
    <RouterLink
      class="lab-submission-page__back"
      :to="{
        name: 'course-labs',
        params: { courseId },
        query: { lab: String(labId) },
      }"
    >
      <ChevronLeft :size="16" />
      Назад
    </RouterLink>

    <p
      v-if="isLoading"
      class="lab-submission-page__status"
      role="status"
    >
      Загрузка работы…
    </p>

    <div
      v-else-if="error !== null"
      class="lab-submission-page__status lab-submission-page__status--error"
      role="alert"
    >
      <span>Не удалось загрузить работу: {{ error }}</span>
      <button
        class="lab-submission-page__retry"
        type="button"
        aria-label="Повторить"
        title="Повторить"
        @click="retry"
      >
        <RotateCw :size="16" />
      </button>
    </div>

    <template v-else-if="lab !== null">
      <h1 class="lab-submission-page__title">
        Лабораторная работа {{ lab.number }}
      </h1>

      <p
        v-if="lab.status === LabStatus.Locked"
        class="lab-submission-page__empty"
      >
        Работа пока недоступна
      </p>

      <div
        v-else
        class="lab-submission-page__content"
      >
        <section
          class="lab-submission-page__section"
          aria-labelledby="files-heading"
        >
          <h2
            id="files-heading"
            class="lab-submission-page__section-title"
          >
            Файлы
          </h2>
          <LabStatusBar
            class="lab-submission-page__status-bar"
            :lab="lab"
          />

          <form
            v-if="canSubmit"
            class="lab-submission-page__form"
            @submit.prevent
          >
            <FileDropzone />
            <label class="lab-submission-page__field">
              <span class="lab-submission-page__label">
                Комментарий к работе
              </span>
              <textarea
                class="lab-submission-page__comment"
                rows="4"
                placeholder="Необязательно"
              />
            </label>
            <div class="lab-submission-page__actions">
              <!-- без выбранного файла отправлять нечего -->
              <button
                class="lab-submission-page__button lab-submission-page__button--primary"
                type="submit"
                disabled
              >
                Отправить работу на проверку
              </button>
              <!-- TODO: черновики появятся вместе с контрактом API -->
              <button
                class="lab-submission-page__button lab-submission-page__button--secondary"
                type="button"
              >
                Сохранить черновик
              </button>
            </div>
          </form>

          <template v-else-if="latestAttempt !== null">
            <SubmittedFileCard
              :file="latestAttempt.file"
              :uploaded-at="latestAttempt.submittedAt"
            />
            <p
              v-if="latestAttempt.comment !== null"
              class="lab-submission-page__note"
            >
              Ваш комментарий: {{ latestAttempt.comment }}
            </p>
          </template>
        </section>

        <section
          class="lab-submission-page__section"
          aria-labelledby="history-heading"
        >
          <h2
            id="history-heading"
            class="lab-submission-page__section-title"
          >
            История
          </h2>
          <p
            v-if="history.length === 0"
            class="lab-submission-page__empty"
          >
            Попыток пока не было.
          </p>
          <ul
            v-else
            class="lab-submission-page__history"
          >
            <li
              v-for="attempt in history"
              :key="attempt.id"
            >
              <LabAttemptCard :attempt="attempt" />
            </li>
          </ul>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.lab-submission-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.lab-submission-page__back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  text-decoration: none;
  transition: color 0.2s ease;
}

.lab-submission-page__back:hover {
  color: var(--color-text);
}

.lab-submission-page__status-bar {
  align-self: flex-start;
}

.lab-submission-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.lab-submission-page__status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.lab-submission-page__status--error {
  color: var(--color-error);
}

.lab-submission-page__retry {
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

.lab-submission-page__retry:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.lab-submission-page__content {
  display: grid;
  align-items: start;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
}

.lab-submission-page__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lab-submission-page__section-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.lab-submission-page__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lab-submission-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.lab-submission-page__label {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.lab-submission-page__comment {
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-md);
  resize: vertical;
}

.lab-submission-page__comment:focus {
  border-color: var(--color-accent);
  outline: none;
}

.lab-submission-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.lab-submission-page__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 2.5rem;
  padding: 0 1.15em;
  border: 1px solid var(--color-accent);
  border-radius: 0.7em;
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.lab-submission-page__button--primary {
  background-color: var(--color-accent);
  color: var(--color-surface);
}

.lab-submission-page__button--primary:disabled {
  border-color: var(--color-border);
  background-color: var(--color-muted-surface);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.lab-submission-page__button--primary:hover:enabled {
  background-color: var(--color-text-secondary);
}

.lab-submission-page__button--secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.lab-submission-page__button--secondary:hover {
  border-color: var(--color-text);
}

.lab-submission-page__note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.lab-submission-page__history {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lab-submission-page__empty {
  margin: 0;
  padding: 1.5rem 1.375rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

@media (width <= 960px) {
  .lab-submission-page__content {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
