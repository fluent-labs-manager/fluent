<script setup lang="ts">
import { useId } from 'vue';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

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
      <InputText
        class="spreadsheet-placeholder__input"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/…"
        aria-label="Ссылка на Google-таблицу"
        :aria-describedby="hintId"
        disabled
      />
      <!-- неактивная кнопка не ловит наведение, поэтому подсказка
           висит на обёртке, как на странице аккаунта -->
      <span v-tooltip.top="'Скоро будет доступно'">
        <Button
          :label="actionLabel"
          :aria-describedby="hintId"
          disabled
        />
      </span>
      <span
        v-if="secondaryActionLabel !== null"
        v-tooltip.top="'Скоро будет доступно'"
      >
        <Button
          :label="secondaryActionLabel"
          severity="secondary"
          variant="outlined"
          :aria-describedby="hintId"
          disabled
        />
      </span>
    </div>
    <!-- подпись видна сразу: до всплывающей подсказки не добраться
         с клавиатуры и на сенсорном экране -->
    <p
      :id="hintId"
      class="spreadsheet-placeholder__hint"
    >
      Скоро будет доступно
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
}

.spreadsheet-placeholder__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
