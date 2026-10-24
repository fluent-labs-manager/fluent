<script setup lang="ts">
import { ref } from 'vue';

import { Upload } from '@lucide/vue';

import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '@/constants/labSubmission.ts';
import { formatFileSize } from '@/utils/FileFormatter.ts';

const emit = defineEmits<{
  select: [file: File];
}>();

const input = ref<HTMLInputElement | null>(null);
// файл держат над областью — подсвечиваем её
const isDragging = ref<boolean>(false);

// подсказка для окна выбора: проверка типа и размера — на странице
const accept = ALLOWED_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(
  ',',
);

const hint = `${ALLOWED_FILE_EXTENSIONS.join(', ').toUpperCase()} до ${formatFileSize(MAX_FILE_SIZE_BYTES)}`;

function openPicker(): void {
  input.value?.click();
}

// к попытке прикладывается один файл: из нескольких берём первый
function selectFirst(files: FileList | null | undefined): void {
  const file = files?.[0];
  if (file !== undefined) {
    emit('select', file);
  }
}

function onChange(): void {
  selectFirst(input.value?.files);
  // сбрасываем, чтобы повторный выбор того же файла тоже сработал
  if (input.value !== null) {
    input.value.value = '';
  }
}

function onDrop(event: DragEvent): void {
  isDragging.value = false;
  selectFirst(event.dataTransfer?.files);
}
</script>

<template>
  <div
    class="file-dropzone"
    :class="{ 'file-dropzone--dragging': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <Upload
      class="file-dropzone__icon"
      :size="28"
      aria-hidden="true"
    />
    <p class="file-dropzone__text">Перетащите файл или выберите</p>
    <p class="file-dropzone__hint">{{ hint }}</p>
    <button
      class="file-dropzone__button"
      type="button"
      @click="openPicker"
    >
      Выбрать файл
    </button>
    <input
      ref="input"
      class="file-dropzone__input"
      type="file"
      :accept="accept"
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    />
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
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.file-dropzone--dragging {
  border-color: var(--color-accent);
  background-color: var(--color-accent-surface);
}

.file-dropzone__icon {
  color: var(--color-text-secondary);
}

.file-dropzone__text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.file-dropzone__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
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
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.file-dropzone__button:hover {
  border-color: var(--color-text);
}

/* окно выбора открывает кнопка, само поле не видно */
.file-dropzone__input {
  display: none;
}
</style>
