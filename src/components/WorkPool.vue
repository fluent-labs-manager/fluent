<script setup lang="ts">
import WorkChip from '@/components/WorkChip.vue';
import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import { useWorkDropTarget } from '@/composables/useWorkDropTarget.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import { getMoveTargets } from '@/utils/ScoreBuilder.ts';

defineProps<{
  // работы, ещё не разложенные по разделам
  works: GradebookWork[];
  // есть ли у дисциплины работы вообще
  hasAnyWorks: boolean;
}>();

const emit = defineEmits<{
  move: [workId: number, section: BarsSection | null];
}>();

const targets = getMoveTargets(null);

// работу из раздела можно перетащить обратно сюда
const { isDragOver, dropHandlers } = useWorkDropTarget((workId) => {
  emit('move', workId, null);
});
</script>

<template>
  <section
    class="work-pool"
    :class="{ 'work-pool--drag-over': isDragOver }"
    aria-labelledby="work-pool-heading"
    v-on="dropHandlers"
  >
    <h2
      id="work-pool-heading"
      class="work-pool__title"
    >
      Работы курса
    </h2>
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
</style>
