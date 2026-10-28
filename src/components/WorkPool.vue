<script setup lang="ts">
import { nextTick, ref, useId } from 'vue';

import { Plus } from '@lucide/vue';
import Button from 'primevue/button';

import AddWorkForm from '@/components/AddWorkForm.vue';
import WorkChip from '@/components/WorkChip.vue';
import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import { useWorkDropTarget } from '@/composables/useWorkDropTarget.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import { getMoveTargets } from '@/utils/ScoreBuilder.ts';
import { focusWorkChip } from '@/utils/WorkChipFocus.ts';

const props = defineProps<{
  // работы, ещё не разложенные по разделам
  works: GradebookWork[];
  // есть ли у дисциплины работы вообще
  hasAnyWorks: boolean;
  // названия всех работ дисциплины: новая не должна с ними совпадать
  existingTitles: string[];
}>();

const emit = defineEmits<{
  move: [workId: number, section: BarsSection | null];
  updateScore: [workId: number, maxScore: number];
  remove: [workId: number];
  add: [title: string, maxScore: number];
}>();

const root = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const addButtonId = useId();
const isAdding = ref<boolean>(false);

// у Button нет метода focus, поэтому кнопку ищем по id
function focusAddButton(): boolean {
  const button = document.getElementById(addButtonId);
  button?.focus();
  return button !== null;
}

async function closeForm(): Promise<void> {
  isAdding.value = false;
  await nextTick();
  focusAddButton();
}

async function add(title: string, maxScore: number): Promise<void> {
  emit('add', title, maxScore);
  await closeForm();
}

// удалённый чип исчезает вместе с фокусом: переводим его на соседнюю
// работу, а если работ не осталось — на кнопку «Добавить работу»
async function remove(workId: number): Promise<void> {
  const index = props.works.findIndex((work) => work.id === workId);
  const neighbour = props.works[index + 1] ?? props.works[index - 1];
  emit('remove', workId);
  await nextTick();
  if (neighbour !== undefined && focusWorkChip(root.value, neighbour.id)) {
    return;
  }
  if (!focusAddButton()) {
    heading.value?.focus();
  }
}

const targets = getMoveTargets(null);

// работу из раздела можно перетащить обратно сюда
const { isDragOver, dropHandlers } = useWorkDropTarget((workId) => {
  emit('move', workId, null);
});
</script>

<template>
  <section
    ref="root"
    class="work-pool"
    :class="{ 'work-pool--drag-over': isDragOver }"
    aria-labelledby="work-pool-heading"
    v-on="dropHandlers"
  >
    <div class="work-pool__header">
      <h2
        id="work-pool-heading"
        ref="heading"
        class="work-pool__title"
        tabindex="-1"
      >
        Работы курса
      </h2>
      <Button
        v-if="!isAdding"
        :id="addButtonId"
        class="work-pool__add"
        label="Добавить работу"
        severity="secondary"
        variant="outlined"
        size="small"
        @click="isAdding = true"
      >
        <template #icon>
          <Plus :size="16" />
        </template>
      </Button>
    </div>
    <ul
      v-if="works.length > 0"
      class="work-pool__list"
    >
      <li
        v-for="work in works"
        :key="work.id"
      >
        <WorkChip
          :work="work"
          :targets="targets"
          @move="(section) => emit('move', work.id, section)"
          @update-score="(maxScore) => emit('updateScore', work.id, maxScore)"
          @remove="remove(work.id)"
        />
      </li>
    </ul>
    <p
      v-else
      class="work-pool__empty"
    >
      {{
        hasAnyWorks
          ? 'Все работы разложены по разделам.'
          : 'У дисциплины пока нет работ.'
      }}
    </p>
    <AddWorkForm
      v-if="isAdding"
      :existing-titles="existingTitles"
      @add="add"
      @cancel="closeForm"
    />
  </section>
</template>

<style scoped>
.work-pool {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-summary);
  box-shadow: var(--shadow-card);
  transition: border-color 0.2s ease;
}

.work-pool--drag-over {
  border-color: var(--color-accent);
}

.work-pool__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
}

.work-pool__title {
  margin: 0;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.work-pool__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.work-pool__list > li {
  max-width: 100%;
}

.work-pool__empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.work-pool__title:focus-visible {
  border-radius: 0.25rem;
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}
</style>
