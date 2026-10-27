<script setup lang="ts">
import { onMounted, ref, useId } from 'vue';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

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
const title = ref<string>('');
// InputText отдаёт значение строкой даже у type="number": пустое или дробное
// значение не превратится молча в число
const score = ref<string>('');
const titleError = ref<string | null>(null);
const scoreError = ref<string | null>(null);

// у InputText нет метода focus, поэтому поле ищем по id
function focusField(id: string): void {
  document.getElementById(id)?.focus();
}

onMounted(() => {
  focusField(titleId);
});

function onTitleInput(value: string | undefined): void {
  title.value = value ?? '';
  titleError.value = null;
}

function onScoreInput(value: string | undefined): void {
  score.value = value ?? '';
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
  focusField(titleError.value !== null ? titleId : scoreId);
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
      <InputText
        :id="titleId"
        :model-value="title"
        class="add-work-form__input"
        :maxlength="MAX_WORK_TITLE_LENGTH"
        placeholder="Например, ЛР6"
        :invalid="titleError !== null"
        :aria-describedby="titleError !== null ? `${titleId}-error` : undefined"
        @update:model-value="onTitleInput"
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
      <InputText
        :id="scoreId"
        :model-value="score"
        class="add-work-form__input"
        type="number"
        inputmode="numeric"
        min="1"
        :max="MAX_WORK_SCORE"
        step="1"
        :invalid="scoreError !== null"
        :aria-describedby="scoreError !== null ? `${scoreId}-error` : undefined"
        @update:model-value="onScoreInput"
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
      <Button
        type="submit"
        label="Добавить"
      />
      <Button
        label="Отмена"
        severity="secondary"
        variant="outlined"
        @click="emit('cancel')"
      />
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
  width: 100%;
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
</style>
