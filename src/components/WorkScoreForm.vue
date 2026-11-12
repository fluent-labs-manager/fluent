<script setup lang="ts">
import { onMounted, ref, useId } from 'vue';

import { Check, X } from '@lucide/vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

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

// кнопки-значки не выше поля, чтобы плашка не раздувалась. Размер задаём
// токеном PrimeVue: обычный CSS перебивают более точные селекторы темы
const actionTokens = { sm: { iconOnlyWidth: '1.75rem' } };
// InputText отдаёт значение строкой даже у type="number": пустое или дробное
// значение не превратится молча в число
const value = ref<string>(String(props.score));
const error = ref<string | null>(null);

// у InputText нет метода focus, поэтому поле ищем по id
onMounted(() => {
  const input = document.getElementById(inputId);
  if (input instanceof HTMLInputElement) {
    input.focus();
    input.select();
  }
});

function onInput(newValue: string | undefined): void {
  value.value = newValue ?? '';
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
    <InputText
      :id="inputId"
      :model-value="value"
      class="work-score-form__input"
      type="number"
      inputmode="numeric"
      min="1"
      :max="MAX_WORK_SCORE"
      step="1"
      size="small"
      :invalid="error !== null"
      @update:model-value="onInput"
    />
    <Button
      type="submit"
      severity="secondary"
      variant="text"
      rounded
      size="small"
      :dt="actionTokens"
      aria-label="Сохранить баллы"
      title="Сохранить баллы"
    >
      <template #icon>
        <Check :size="16" />
      </template>
    </Button>
    <Button
      severity="secondary"
      variant="text"
      rounded
      size="small"
      :dt="actionTokens"
      aria-label="Отменить"
      title="Отменить"
      @click="emit('cancel')"
    >
      <template #icon>
        <X :size="16" />
      </template>
    </Button>
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
  text-align: center;
}

.work-score-form__error {
  flex-basis: 100%;
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}
</style>
