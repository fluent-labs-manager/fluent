<script setup lang="ts">
import { useId } from 'vue';

// карточка работы с Google-таблицей. В макете это заглушка: поле и кнопки
// неактивны, а подпись рядом объясняет почему. TODO: подключить, когда
// появится интеграция с Google Sheets
withDefaults(
  defineProps<{
    title: string;
    actionLabel: string;
    // ещё одно действие рядом с основным
    secondaryActionLabel?: string | null;
  }>(),
  { secondaryActionLabel: null },
);

const headingId = useId();
const hintId = useId();
</script>

<template>
  <section
    class="spreadsheet-placeholder"
    :aria-labelledby="headingId"
  >
    <h2
      :id="headingId"
      class="spreadsheet-placeholder__title"
    >
      {{ title }}
    </h2>
    <div class="spreadsheet-placeholder__row">
      <input
        class="spreadsheet-placeholder__input"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/…"
        aria-label="Ссылка на Google-таблицу"
        :aria-describedby="hintId"
        disabled
      />
      <button
        class="spreadsheet-placeholder__button spreadsheet-placeholder__button--primary"
        type="button"
        :aria-describedby="hintId"
        disabled
      >
        {{ actionLabel }}
      </button>
      <button
        v-if="secondaryActionLabel !== null"
        class="spreadsheet-placeholder__button spreadsheet-placeholder__button--secondary"
        type="button"
        :aria-describedby="hintId"
        disabled
      >
        {{ secondaryActionLabel }}
      </button>
    </div>
    <!-- подпись видна сразу: всплывающую подсказку у неактивной кнопки
         показывают не все браузеры -->
    <p
      :id="hintId"
      class="spreadsheet-placeholder__hint"
    >
      Будет доступно позже
    </p>
  </section>
</template>

<style scoped>
.spreadsheet-placeholder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.spreadsheet-placeholder__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.spreadsheet-placeholder__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.spreadsheet-placeholder__input {
  flex: 1 1 16rem;
  min-width: 0;
  height: 2.75rem;
  padding: 0 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-muted-surface);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: var(--font-size-md);
  cursor: not-allowed;
}

.spreadsheet-placeholder__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 2.75rem;
  padding: 0 1.15em;
  border: 1px solid var(--color-border);
  border-radius: 0.7em;
  background-color: var(--color-muted-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
  cursor: not-allowed;
}

.spreadsheet-placeholder__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
