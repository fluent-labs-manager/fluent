<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, FileText, Paperclip, RotateCw } from '@lucide/vue';
import { useLabSubmission } from '@/composables/useLabSubmission.ts';

const router = useRouter();
const route = useRoute();

const labId = computed<number>(() => Number(route.params.labId) || 3);
const courseId = computed<number>(() => Number(route.params.courseId) || 1);

const { submission, isLoading, error, reload, submitWork } = useLabSubmission(
  labId.value,
);

const comment = ref('');

const isSubmitting = ref(false);

const handleGoBack = (): void => {
  void router.push({
    name: 'course-labs',
    params: { courseId: courseId.value },
  });
};

const handleSubmit = async (): Promise<void> => {
  isSubmitting.value = true;
  await submitWork(comment.value);
  isSubmitting.value = false;
};

const handleDeleteFile = (): void => {
  if (submission.value?.currentFile) {
    submission.value.currentFile = undefined;
  }
};
</script>

<template>
  <main class="lab-submission-page">
    <header class="page-header">
      <button
        class="back-btn"
        type="button"
        @click="handleGoBack"
      >
        <ChevronLeft :size="16" />
        Назад
      </button>

      <h1 class="page-title">
        {{ submission?.labTitle ?? 'Лабораторная работа' }}
      </h1>
    </header>

    <p
      v-if="isLoading"
      class="status-message"
      role="status"
    >
      Загрузка лабораторной работы…
    </p>

    <div
      v-else-if="error !== null"
      class="status-message status-message--error"
      role="alert"
    >
      <span>Не удалось загрузить данные: {{ error }}</span>
      <button
        class="retry-btn"
        type="button"
        aria-label="Повторить"
        title="Повторить"
        @click="reload"
      >
        <RotateCw :size="16" />
      </button>
    </div>

    <div
      v-else-if="submission !== null"
      class="submission-layout"
    >
      <section class="submission-form">
        <div class="field-section">
          <span class="section-label">ФАЙЛЫ</span>

          <div
            v-if="submission.status === 'in_review'"
            class="status-badge"
          >
            <span class="status-dot"></span>
            <span class="status-text">На проверке</span>
          </div>

          <div
            v-if="submission.currentFile"
            class="file-card"
          >
            <div class="file-icon-box">
              <FileText :size="24" />
            </div>

            <div class="file-info">
              <span class="file-name">{{ submission.currentFile.name }}</span>
              <span class="file-meta">
                Загружено {{ submission.currentFile.uploadedAt }} ·
                {{ submission.currentFile.size }}
              </span>
            </div>

            <span class="pdf-tag">PDF</span>

            <button
              class="delete-file-btn"
              type="button"
              @click="handleDeleteFile"
            >
              Удалить файл
            </button>
          </div>
        </div>

        <div class="field-section">
          <label
            class="section-label"
            for="studentComment"
            >КОММЕНТАРИЙ К СДАЧЕ</label
          >
          <input
            id="studentComment"
            v-model="comment"
            class="comment-input"
            type="text"
            placeholder="Добавить текстовый комментарий для преподавателя..."
          />
        </div>

        <div class="actions-row">
          <button
            class="submit-action-btn"
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            Отправить работу на проверку
          </button>

          <button
            class="draft-action-btn"
            type="button"
          >
            Сохранить черновик
          </button>
        </div>
      </section>

      <aside class="submission-history">
        <span class="section-label">ИСТОРИЯ</span>

        <div class="history-list">
          <article
            v-for="attempt in submission.attempts"
            :key="attempt.id"
            class="attempt-card"
          >
            <div class="attempt-header">
              <h2 class="attempt-title">
                Попытка {{ attempt.attemptNumber }} — {{ attempt.date }}
              </h2>
              <span
                class="attempt-badge"
                :class="
                  attempt.status === 'accepted'
                    ? 'attempt-badge--accepted'
                    : 'attempt-badge--rejected'
                "
              >
                {{ attempt.status === 'accepted' ? 'ПРИНЯТО' : 'ОТКЛОНЕНО' }}
              </span>
            </div>

            <p class="attempt-feedback">
              {{ attempt.comment }}
            </p>

            <div class="attempt-file">
              <Paperclip :size="14" />
              <span class="attempt-file-name">
                {{ attempt.fileName }} · {{ attempt.fileSize }}
              </span>
            </div>
          </article>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.lab-submission-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  padding: 0;
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.back-btn:hover {
  color: var(--color-text);
}

.page-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.status-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--nav-item-height);
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.status-message--error {
  color: var(--color-error);
}

.retry-btn {
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
}

.submission-layout {
  display: flex;
  align-items: flex-start;
  gap: 2.5rem;
}

.submission-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 41.25rem;
}

.field-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  height: 3.5rem;
  padding: 0 1.25rem;
  border-radius: 1rem;
  background-color: var(--color-accent-surface);
}

.status-dot {
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 50%;
  background-color: var(--color-accent);
}

.status-text {
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 700;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 6.5rem;
  padding: 0 1.625rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.file-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.75rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text-secondary);
}

.file-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 700;
}

.file-meta {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.pdf-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.625rem;
  border-radius: 62.4375rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
  font-size: 0.6875rem;
  font-weight: 700;
}

.delete-file-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-error);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.delete-file-btn:hover {
  text-decoration: underline;
}

.comment-input {
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
}

.comment-input:focus {
  border-color: var(--color-accent);
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.submit-action-btn {
  width: 16.875rem;
  height: 2.875rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.submit-action-btn:hover {
  background-color: var(--color-btn-primary-hover);
}

.submit-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.draft-action-btn {
  width: 11.875rem;
  height: 2.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.draft-action-btn:hover {
  border-color: var(--color-accent);
}

.submission-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 25.625rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.attempt-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.attempt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attempt-title {
  margin: 0;
  color: var(--color-text);
  font-size: 0.8125rem;
  font-weight: 700;
}

.attempt-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 62.4375rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.attempt-badge--rejected {
  background-color: #fce8e6;
  color: var(--color-error);
}

.attempt-badge--accepted {
  background-color: var(--color-success-surface);
  color: var(--color-success-text);
}

.attempt-feedback {
  margin: 0;
  color: var(--color-text);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.attempt-file {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
}
</style>
