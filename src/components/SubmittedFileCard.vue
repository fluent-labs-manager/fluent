<script setup lang="ts">
import { computed } from 'vue';

import { FileText } from '@lucide/vue';

import type { SubmittedFile } from '@/api/labs/SubmittedFile.dto.ts';
import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import { formatDateTime } from '@/utils/DateFormatter.ts';
import { formatFileSize, getFileType } from '@/utils/FileFormatter.ts';

const props = withDefaults(
  defineProps<{
    file: SubmittedFile;
    // у выбранного, но ещё не отправленного файла даты нет
    uploadedAt?: IsoDateTime | null;
    // файл, отправленный на проверку, удалить нельзя
    removable?: boolean;
  }>(),
  { uploadedAt: null, removable: false },
);

const emit = defineEmits<{
  remove: [];
}>();

const details = computed<string>(() => {
  const size = formatFileSize(props.file.size);
  return props.uploadedAt === null
    ? size
    : `Загружено ${formatDateTime(props.uploadedAt)} · ${size}`;
});

const fileType = computed<string>(() => getFileType(props.file.name));
</script>

<template>
  <div class="submitted-file-card">
    <FileText
      class="submitted-file-card__icon"
      :size="24"
      aria-hidden="true"
    />
    <div class="submitted-file-card__info">
      <span
        class="submitted-file-card__name"
        :title="file.name"
      >
        {{ file.name }}
      </span>
      <span class="submitted-file-card__details">{{ details }}</span>
    </div>
    <span
      v-if="fileType !== ''"
      class="submitted-file-card__type"
    >
      {{ fileType }}
    </span>
    <button
      v-if="removable"
      class="submitted-file-card__remove"
      type="button"
      @click="emit('remove')"
    >
      Удалить файл
    </button>
  </div>
</template>

<style scoped>
.submitted-file-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
}

.submitted-file-card__icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.submitted-file-card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.submitted-file-card__name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submitted-file-card__details {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.submitted-file-card__type {
  flex-shrink: 0;
  padding: 0.25em 0.625em;
  border-radius: 0.5em;
  background-color: var(--color-accent-surface);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.submitted-file-card__remove {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
}

.submitted-file-card__remove:hover {
  text-decoration: underline;
}
</style>
