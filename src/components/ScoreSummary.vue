<script setup lang="ts">
import { ref, useId, watch } from 'vue';

import InputText from 'primevue/inputtext';

import { MAX_ADMISSION_THRESHOLD } from '@/constants/barsSections.ts';

const props = defineProps<{
  // сколько баллов разложено по разделам
  distributedScore: number;
  maxScore: number;
  isOverMaxScore: boolean;
  admissionThreshold: number;
}>();

const emit = defineEmits<{
  'update:admissionThreshold': [threshold: number];
}>();

const inputId = useId();
const hintId = useId();

// то, что введено в поле: неверное значение не уходит наружу
const thresholdInput = ref<string>(String(props.admissionThreshold));
const thresholdError = ref<string | null>(null);

watch(
  () => props.admissionThreshold,
  (threshold) => {
    thresholdInput.value = String(threshold);
    thresholdError.value = null;
  },
);

// InputText отдаёт значение строкой даже у type="number": пустое или дробное
// значение не превратится молча в число и его можно отличить от верного
function updateThreshold(value: string | undefined): void {
  thresholdInput.value = value ?? '';
  const threshold = Number(thresholdInput.value);
  const isValid =
    thresholdInput.value.trim() !== '' &&
    Number.isInteger(threshold) &&
    threshold >= 0 &&
    threshold <= MAX_ADMISSION_THRESHOLD;
  thresholdError.value = isValid
    ? null
    : `Порог — целое число от 0 до ${String(MAX_ADMISSION_THRESHOLD)}`;
  if (isValid) {
    emit('update:admissionThreshold', threshold);
  }
}
</script>

<template>
  <div class="score-summary">
    <p class="score-summary__total">
      Распределено
      <span
        class="score-summary__value"
        :class="{ 'score-summary__value--over': isOverMaxScore }"
      >
        {{ distributedScore }} из {{ maxScore }}
      </span>
    </p>
    <div class="score-summary__admission">
      <label
        class="score-summary__label"
        :for="inputId"
      >
        Допуск от
      </label>
      <InputText
        :id="inputId"
        :model-value="thresholdInput"
        class="score-summary__input"
        type="number"
        inputmode="numeric"
        min="0"
        :max="MAX_ADMISSION_THRESHOLD"
        step="1"
        size="small"
        :invalid="thresholdError !== null"
        :aria-describedby="hintId"
        @update:model-value="updateThreshold"
      />
      <span
        :id="hintId"
        class="score-summary__hint"
      >
        баллов
      </span>
    </div>
    <p
      v-if="thresholdError !== null"
      class="score-summary__error"
      role="alert"
    >
      {{ thresholdError }}
    </p>
  </div>
</template>

<style scoped>
.score-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
}

.score-summary__total {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.score-summary__value {
  color: var(--color-accent);
  font-weight: 700;
}

.score-summary__value--over {
  color: var(--color-error);
}

.score-summary__admission {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-md);
}

.score-summary__label {
  color: var(--color-text-secondary);
}

.score-summary__input {
  width: 4.5rem;
  text-align: center;
}

.score-summary__hint {
  color: var(--color-text-secondary);
}

.score-summary__error {
  flex-basis: 100%;
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
