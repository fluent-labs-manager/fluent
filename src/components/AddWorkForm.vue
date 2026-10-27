<script setup lang="ts">
import { onMounted, ref, useId } from 'vue';

import {
  MAX_WORK_SCORE,
  MAX_WORK_TITLE_LENGTH,
} from '@/constants/gradebookWork.ts';
import { parseWorkScore, validateWorkTitle } from '@/utils/WorkValidation.ts';

const props = defineProps<{
  // названия работ дисциплины: новое не должно с ними совпадать
  existingTitles: string[];
}>();

const emit = defineEmits<{
  add: [title: string, maxScore: number];
  cancel: [];
}>();

const titleId = useId();
const scoreId = useId();
const titleInput = ref<HTMLInputElement | null>(null);
const scoreInput = ref<HTMLInputElement | null>(null);
const title = ref<string>('');
const score = ref<string>('');
const titleError = ref<string | null>(null);
const scoreError = ref<string | null>(null);

onMounted(() => {
  titleInput.value?.focus();
});

function onTitleInput(event: Event): void {
  title.value = (event.target as HTMLInputElement).value;
  titleError.value = null;
}

// поле читаем строкой: v-model у type="number" сам превращает ввод в число
function onScoreInput(event: Event): void {
  score.value = (event.target as HTMLInputElement).value;
  scoreError.value = null;
}

function submit(): void {
  titleError.value = validateWorkTitle(title.value, props.existingTitles);
  const result = parseWorkScore(score.value);
  scoreError.value = result.error;
  if (titleError.value === null && result.score !== null) {
    emit('add', title.value.trim(), result.score);
    return;
  }
  // фокус на первое поле с ошибкой: так её сразу видно и слышно
  (titleError.value !== null ? titleInput : scoreInput).value?.focus();
}
</script>

<template>
  <form
    class="add-work-form"
    novalidate
    @submit.prevent="submit"
    @keydown.esc="emit('cancel')"
  >
    <div class="add-work-form__field add-work-form__field--title">
      <label
        class="add-work-form__label"
        :for="titleId"
      >
        Название
      </label>
      <input
        :id="titleId"
        ref="titleInput"
        :value="title"
        class="add-work-form__input"
        type="text"
        :maxlength="MAX_WORK_TITLE_LENGTH"
        placeholder="Например, ЛР6"
        :aria-invalid="titleError !== null"
        :aria-describedby="titleError !== null ? `${titleId}-error` : undefined"
        @input="onTitleInput"
      />
      <p
        v-if="titleError !== null"
        :id="`${titleId}-error`"
        class="add-work-form__error"
      >
        {{ titleError }}
      </p>
    </div>
    <div class="add-work-form__field add-work-form__field--score">
      <label
        class="add-work-form__label"
        :for="scoreId"
      >
        Баллы
      </label>
      <input
        :id="scoreId"
        ref="scoreInput"
        :value="score"
        class="add-work-form__input"
        type="number"
        inputmode="numeric"
        min="1"
        :max="MAX_WORK_SCORE"
        step="1"
        :aria-invalid="scoreError !== null"
        :aria-describedby="scoreError !== null ? `${scoreId}-error` : undefined"
        @input="onScoreInput"
      />
      <p
        v-if="scoreError !== null"
        :id="`${scoreId}-error`"
        class="add-work-form__error"
      >
        {{ scoreError }}
      </p>
    </div>
    <div class="add-work-form__actions">
      <button
        class="add-work-form__button add-work-form__button--primary"
        type="submit"
      >
        Добавить
      </button>
      <button
        class="add-work-form__button add-work-form__button--secondary"
        type="button"
        @click="emit('cancel')"
      >
        Отмена
      </button>
    </div>
  </form>
</template>

<style scoped>
.add-work-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.75rem;
}

.add-work-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.add-work-form__field--title {
  flex: 1 1 14rem;
  max-width: 24rem;
}

.add-work-form__field--score {
  width: 6rem;
}

.add-work-form__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.add-work-form__input {
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-md);
}

.add-work-form__input:focus {
  border-color: var(--color-accent);
  outline: none;
}

.add-work-form__input[aria-invalid='true'] {
  border-color: var(--color-error);
}

.add-work-form__error {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

/* кнопки встают вровень с полями, а не с подписями над ними */
.add-work-form__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1.5rem;
}

.add-work-form__button {
  display: inline-flex;
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
    border-color 0.2s ease;
}

.add-work-form__button--primary {
  background-color: var(--color-accent);
  color: var(--color-surface);
}

.add-work-form__button--primary:hover {
  background-color: var(--color-text-secondary);
}

.add-work-form__button--secondary {
  background-color: var(--color-surface);
  color: var(--color-accent);
}

.add-work-form__button--secondary:hover {
  background-color: var(--color-accent-surface);
}
</style>
