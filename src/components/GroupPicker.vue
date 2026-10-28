<script setup lang="ts">
import Checkbox from 'primevue/checkbox';

import type { StudentGroup } from '@/api/gradebook/StudentGroup.dto.ts';
import { pluralize } from '@/utils/Plural.ts';

defineProps<{
  groups: StudentGroup[];
  // названия отмеченных групп
  checkedNames: string[];
}>();

const emit = defineEmits<{
  change: [groupName: string, isChecked: boolean];
}>();

function studentCount(group: StudentGroup): string {
  return pluralize(group.students.length, ['студент', 'студента', 'студентов']);
}

function onChange(groupName: string, isChecked: boolean): void {
  emit('change', groupName, isChecked);
}
</script>

<template>
  <fieldset class="group-picker">
    <legend class="group-picker__legend">Группы</legend>
    <div class="group-picker__list">
      <label
        v-for="group in groups"
        :key="group.name"
        class="group-picker__option"
        :class="{
          'group-picker__option--checked': checkedNames.includes(group.name),
        }"
      >
        <Checkbox
          class="group-picker__checkbox"
          :model-value="checkedNames.includes(group.name)"
          binary
          @update:model-value="onChange(group.name, $event)"
        />
        <span class="group-picker__name">{{ group.name }}</span>
        <!-- Vue убирает пробелы между тегами на разных строках, а экранному
             диктору нужен «P3322 6 студентов», а не «P33226 студентов» -->
        {{ ' ' }}
        <span class="group-picker__count">{{ studentCount(group) }}</span>
      </label>
    </div>
    <p
      v-if="checkedNames.length === 0"
      class="group-picker__hint"
    >
      Отметьте хотя бы одну группу — для каждой будет своя вкладка в ведомости.
    </p>
  </fieldset>
</template>

<style scoped>
.group-picker {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
}

.group-picker__legend {
  margin-bottom: 0.625rem;
  padding: 0;
  font-size: var(--font-size-md);
  font-weight: 500;
}

.group-picker__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.group-picker__option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.group-picker__option:hover {
  border-color: var(--color-accent);
}

.group-picker__option--checked {
  border-color: var(--color-accent);
  background-color: var(--color-accent-surface);
}

.group-picker__name {
  font-weight: 700;
}

.group-picker__count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.group-picker__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
