<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Code, FileText, Trash2 } from '@lucide/vue';

const router = useRouter();

const student = ref({
  name: 'Горелова Ульяна',
  group: 'P3322',
  variant: 42,
  labNumber: 3,
  fileName: 'myau.py',
});

const questions = ref<string[]>([
  'Объясните выбор каскадного удаления для таблицы OrderDetails.',
]);

const feedbackComment = ref('');

const grade = ref<number | ''>(0);
const maxGrade = 10;
const gradeError = ref('');

const handleGoBack = (): void => {
  void router.push({ name: 'review-queue' });
};

const handleOpenReport = (): void => {
  // Открытие отчета (например, превью или модалка)
  alert('Открытие PDF-отчета студента Горелова Ульяна');
};

const handleOpenCode = (): void => {
  // Открытие файла с кодом
  alert('Просмотр исходного кода myau.py');
};

const handleAddQuestion = (): void => {
  questions.value.push('');
};

const handleRemoveQuestion = (index: number): void => {
  questions.value.splice(index, 1);
};

const handleSaveGrade = (): void => {
  gradeError.value = '';

  if (grade.value === '' || grade.value < 0 || grade.value > maxGrade) {
    gradeError.value = `Балл должен быть от 0 до ${String(maxGrade)}`;
    return;
  }

  void router.push({ name: 'review-queue' });
};
</script>

<template>
  <main class="grading-page">
    <header class="page-header">
      <button
        class="back-btn"
        type="button"
        @click="handleGoBack"
      >
        <ChevronLeft :size="16" />
        Назад в очередь
      </button>

      <h1 class="page-title">Оценивание</h1>
    </header>

    <div class="grading-workspace">
      <section class="column-student">
        <article class="card student-card">
          <div class="student-header">
            <span class="badge">
              {{ student.group }} • ВАРИАНТ {{ student.variant }}
            </span>
            <span class="lab-number"
              >Лабораторная №{{ student.labNumber }}</span
            >
          </div>

          <h2 class="student-name">{{ student.name }}</h2>

          <div class="file-chip">
            <Code
              :size="17"
              class="file-icon"
            />
            <span class="file-name">{{ student.fileName }}</span>
          </div>
        </article>

        <div class="review-actions">
          <button
            class="action-outline-btn"
            type="button"
            @click="handleOpenReport"
          >
            <FileText :size="16" />
            Открыть отчет
          </button>

          <button
            class="action-outline-btn"
            type="button"
            @click="handleOpenCode"
          >
            <Code :size="16" />
            Открыть код
          </button>
        </div>
      </section>

      <section class="column-defense">
        <article class="card questions-card">
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="question-block"
          >
            <div class="question-header">
              <span class="question-label">ВОПРОС {{ index + 1 }}</span>
              <button
                v-if="questions.length > 1"
                class="remove-question-btn"
                type="button"
                title="Удалить вопрос"
                @click="handleRemoveQuestion(index)"
              >
                <Trash2 :size="14" />
              </button>
            </div>

            <textarea
              v-model="questions[index]"
              class="question-input"
              placeholder="Введите вопрос к защите..."
              rows="2"
            ></textarea>

            <div
              v-if="index < questions.length - 1"
              class="divider"
            ></div>
          </div>

          <button
            class="add-question-btn"
            type="button"
            @click="handleAddQuestion"
          >
            + Добавить вопрос...
          </button>
        </article>

        <div class="comment-field">
          <textarea
            v-model="feedbackComment"
            class="comment-textarea"
            placeholder="Добавьте обратную связь по работе (замечания, комментарии)..."
          ></textarea>
        </div>
      </section>

      <section class="column-grade">
        <article class="card grade-card">
          <h2 class="grade-title">Ввод оценки</h2>
          <span class="grade-subtitle">Итоговый балл</span>

          <div class="grade-input-wrapper">
            <input
              v-model.number="grade"
              class="grade-input"
              type="number"
              min="0"
              :max="maxGrade"
              placeholder="0"
            />
            <span class="grade-unit">/{{ maxGrade }}</span>
          </div>

          <p
            v-if="gradeError"
            class="field-error"
          >
            {{ gradeError }}
          </p>

          <button
            class="save-grade-btn"
            type="button"
            @click="handleSaveGrade"
          >
            Сохранить оценку
          </button>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.grading-page {
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

.grading-workspace {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  max-width: 68.25rem;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.column-student {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 22.5rem;
}

.student-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.625rem;
  border-radius: 62.4375rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lab-number {
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
}

.student-name {
  margin: 0;
  color: var(--color-text);
  font-size: 1.4375rem;
  font-weight: 700;
}

.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5625rem;
  align-self: flex-start;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  background-color: var(--color-accent-surface);
}

.file-icon {
  color: var(--color-accent);
}

.file-name {
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: underline;
}

.review-actions {
  display: flex;
  gap: 0.625rem;
}

.action-outline-btn {
  display: inline-flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  height: 2.875rem;
  border: 1px solid var(--color-accent);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-accent);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-outline-btn:hover {
  background-color: var(--color-accent-surface);
}

.column-defense {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 21.625rem;
}

.questions-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
}

.question-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-label {
  color: var(--color-accent);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.remove-question-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.remove-question-btn:hover {
  color: var(--color-error);
}

.question-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.question-input:focus {
  border-color: var(--color-accent);
}

.divider {
  height: 1px;
  background-color: var(--color-border);
}

.add-question-btn {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.add-question-btn:hover {
  color: var(--color-accent);
}

.comment-field {
  width: 100%;
}

.comment-textarea {
  width: 100%;
  height: 4.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.75rem;
  resize: none;
}

.comment-textarea:focus {
  border-color: var(--color-accent);
}

/* 3. Колонка ввода оценки */
.column-grade {
  width: 21.625rem;
}

.grade-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.grade-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.grade-subtitle {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.grade-input-wrapper {
  display: inline-flex;
  align-items: center;
  width: 7.5rem;
  height: 2.875rem;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
}

.grade-input {
  width: 2.5rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 700;
}

.grade-unit {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
}

.field-error {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.save-grade-btn {
  width: 100%;
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

.save-grade-btn:hover {
  background-color: var(--color-btn-primary-hover);
}
</style>
