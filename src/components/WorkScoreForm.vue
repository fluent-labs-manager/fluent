<script setup lang="ts">
import { onMounted, ref, useId } from 'vue';

import { Check, X } from '@lucide/vue';

import { MAX_WORK_SCORE } from '@/constants/gradebookWork.ts';
import { parseWorkScore } from '@/utils/WorkValidation.ts';

const props = defineProps<{
  // название работы — для подписи поля
  title: string;
  score: number;
}>();

const emit = defineEmits<{
  save: [score: number];
  cancel: [];
}>();

const inputId = useId();
const input = ref<HTMLInputElement | null>(null);
const value = ref<string>(String(props.score));
const error = ref<string | null>(null);

onMounted(() => {
  input.value?.focus();
  input.value?.select();
});

// поле читаем строкой: v-model у type="number" сам превращает ввод в число
function onInput(event: Event): void {
  value.value = (event.target as HTMLInputElement).value;
  error.value = null;
}

function save(): void {
  const result = parseWorkScore(value.value);
  error.value = result.error;
  if (result.score !== null) {
    emit('save', result.score);
  }
}
</script>

<template>
  <form
    class="work-score-form"
    @submit.prevent="save"
    @keydown.esc.stop="emit('cancel')"
  >
    <label
      class="work-score-form__label"
      :for="inputId"
    >
      {{ title }}
    </label>
    <input
      :id="inputId"
      ref="input"
      :value="value"
      class="work-score-form__input"
      type="number"
      inputmode="numeric"
      min="1"
      :max="MAX_WORK_SCORE"
      step="1"
      :aria-invalid="error !== null"
      @input="onInput"
    />
    <button
      class="work-score-form__action"
      type="submit"
      aria-label="Сохранить баллы"
      title="Сохранить баллы"
    >
      <Check :size="16" />
    </button>
    <button
      class="work-score-form__action"
      type="button"
      aria-label="Отменить"
      title="Отменить"
      @click="emit('cancel')"
    >
      <X :size="16" />
    </button>
    <p
      v-if="error !== null"
      class="work-score-form__error"
      role="alert"
    >
      {{ error }}
    </p>
  </form>
</template>

<style scoped>
.work-score-form {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  max-width: 100%;
  padding: 0.25rem 0.375rem 0.25rem 0.875rem;
  border: 1px solid var(--color-accent);
  border-radius: 1.25rem;
  background-color: var(--color-surface);
}

.work-score-form__label {
  min-width: 0;
  font-size: var(--font-size-md);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.work-score-form__input {
  width: 3.5rem;
  padding: 0.125rem 0.375rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  text-align: center;
}

.work-score-form__input:focus {
  border-color: var(--color-accent);
  outline: none;
}

.work-score-form__input[aria-invalid='true'] {
  border-color: var(--color-error);
}

.work-score-form__action {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.work-score-form__action:hover {
  background-color: var(--color-accent-surface);
  color: var(--color-accent);
}

.work-score-form__error {
  flex-basis: 100%;
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}
</style>
