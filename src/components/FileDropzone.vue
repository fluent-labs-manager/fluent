<script setup lang="ts">
import { Upload } from '@lucide/vue';

// TODO: выбор файла и перетаскивание — в следующем шаге задачи, пока область неактивна
</script>

<template>
  <div class="file-dropzone">
    <Upload
      class="file-dropzone__icon"
      :size="28"
      aria-hidden="true"
    />
    <p class="file-dropzone__text">Перетащите файл или выберите</p>
    <button
      class="file-dropzone__button"
      type="button"
      disabled
    >
      Выбрать файл
    </button>
  </div>
</template>

<style scoped>
.file-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  text-align: center;
}

.file-dropzone__icon {
  color: var(--color-text-secondary);
}

.file-dropzone__text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.file-dropzone__button {
  display: inline-flex;
  align-items: center;
  height: 2.5rem;
  padding: 0 1.15em;
  border: 1px solid var(--color-accent);
  border-radius: 0.7em;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
}

.file-dropzone__button:disabled {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}
</style>
