<script setup lang="ts">
import { computed } from 'vue';

import WorkChip from '@/components/WorkChip.vue';
import { useWorkDropTarget } from '@/composables/useWorkDropTarget.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import type { SectionSummary } from '@/types/SectionSummary.ts';
import type { WorkMoveTarget } from '@/types/WorkMoveTarget.ts';
import { getMoveTargets } from '@/utils/ScoreBuilder.ts';

const props = defineProps<{
  summary: SectionSummary;
}>();

const emit = defineEmits<{
  move: [workId: number, section: BarsSection | null];
}>();

const targets = computed<WorkMoveTarget[]>(() =>
  getMoveTargets(props.summary.section),
);

const headingId = computed<string>(
  () => `bars-section-${props.summary.section}`,
);

const { isDragOver, dropHandlers } = useWorkDropTarget((workId) => {
  emit('move', workId, props.summary.section);
});
</script>

<template>
  <section
    class="bars-section-card"
    :class="{ 'bars-section-card--drag-over': isDragOver }"
    :aria-labelledby="headingId"
    v-on="dropHandlers"
  >
    <header class="bars-section-card__header">
      <h3
        :id="headingId"
        class="bars-section-card__title"
      >
        {{ summary.title }}
      </h3>
      <span
        class="bars-section-card__score"
        :class="{ 'bars-section-card__score--over': summary.isOverLimit }"
      >
        {{ summary.score }} из {{ summary.limit }}
      </span>
    </header>
    <ul
      v-if="summary.works.length > 0"
      class="bars-section-card__list"
    >
      <li
        v-for="work in summary.works"
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
      class="bars-section-card__empty"
    >
      Перетащите вид работы
    </p>
  </section>
</template>

<style scoped>
.bars-section-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.bars-section-card--drag-over {
  border-color: var(--color-accent);
  background-color: var(--color-accent-surface);
}

.bars-section-card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.bars-section-card__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 700;
}

.bars-section-card__score {
  flex-shrink: 0;
  color: var(--color-accent);
  font-size: var(--font-size-md);
  font-weight: 700;
  white-space: nowrap;
}

.bars-section-card__score--over {
  color: var(--color-error);
}

.bars-section-card__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bars-section-card__list > li {
  max-width: 100%;
}

.bars-section-card__empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
