<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import ActiveLabCard from '@/components/ActiveLabCard.vue';
import AppIcon from '@/components/AppIcon.vue';
import LabListItem from '@/components/LabListItem.vue';
import { useCourseLabs } from '@/composables/useCourseLabs.ts';
import { useNow } from '@/composables/useNow.ts';
import type { Lab, NotSubmittedLab } from '@/api/labs/Lab.dto.ts';
import { LabStatus } from '@/types/LabStatus.ts';

const props = defineProps<{
  courseId: number;
}>();

const { courseLabs, isLoading, error, reload } = useCourseLabs(
  () => props.courseId,
);

// срок сдачи сравнивается с этим временем, поэтому меняется без перезагрузки
const now = useNow();

const labs = computed<Lab[]>(() => courseLabs.value?.labs ?? []);

// активные работы — всё, что можно выполнять сейчас, по порядку номеров
const activeLabs = computed<NotSubmittedLab[]>(() =>
  labs.value
    .filter((lab) => lab.status === LabStatus.NotSubmitted)
    .sort((first, second) => first.number - second.number),
);

// по макету: одна или две работы идут столбиком, три и больше — сеткой
const isActiveLabsGrid = computed<boolean>(() => activeLabs.value.length >= 3);

const activeLabsTitle = computed<string>(() =>
  activeLabs.value.length === 1 ? 'Активная работа' : 'Активные работы',
);

const completedLabs = computed<number>(
  () => labs.value.filter((lab) => lab.status === LabStatus.Submitted).length,
);

// номер ближайшей работы списка с меньшим номером: номера могут идти с пропусками
function getPreviousLabNumber(lab: Lab): number | null {
  const previousNumbers = labs.value
    .map((item) => item.number)
    .filter((number) => number < lab.number);

  return previousNumbers.length > 0 ? Math.max(...previousNumbers) : null;
}

function retry(): void {
  void reload();
}

function openVariant(): void {
  // TODO: перейти к условиям варианта. Куда именно (страница Fluent, PDF,
  // внешний ресурс) — ещё не решено.
}

function openTask(): void {
  // TODO: перейти к заданию, когда появится страница сдачи лабораторной.
}
</script>

<template>
  <main class="course-labs-page">
    <header class="course-labs-page__header">
      <RouterLink
        class="course-labs-page__back"
        :to="{ name: 'courses' }"
        aria-label="К дисциплинам"
        title="К дисциплинам"
      >
        <AppIcon
          name="arrow-left"
          :size="16"
        />
      </RouterLink>

      <p
        v-if="isLoading"
        class="course-labs-page__status"
        role="status"
      >
        Загрузка лабораторных работ…
      </p>

      <div
        v-else-if="error !== null"
        class="course-labs-page__status course-labs-page__status--error"
        role="alert"
      >
        <span>Не удалось загрузить лабораторные работы: {{ error }}</span>
        <button
          class="course-labs-page__retry"
          type="button"
          aria-label="Повторить"
          title="Повторить"
          @click="retry"
        >
          <AppIcon
            name="refresh"
            :size="16"
          />
        </button>
      </div>

      <template v-else-if="courseLabs !== null">
        <h1
          class="course-labs-page__title"
          :title="courseLabs.course.title"
        >
          {{ courseLabs.course.title }}
        </h1>
        <span
          v-if="labs.length > 0"
          class="course-labs-page__progress"
        >
          {{ completedLabs }} из {{ labs.length }} выполнено
        </span>
      </template>
    </header>

    <template v-if="!isLoading && error === null && courseLabs !== null">
      <p
        v-if="labs.length === 0"
        class="course-labs-page__empty"
      >
        Лабораторных работ пока нет.
      </p>

      <div
        v-else
        class="course-labs-page__content"
        :class="{ 'course-labs-page__content--wide': isActiveLabsGrid }"
      >
        <section
          class="course-labs-page__section"
          aria-labelledby="active-lab-heading"
        >
          <h2
            id="active-lab-heading"
            class="course-labs-page__section-title"
          >
            {{ activeLabsTitle }}
          </h2>
          <p
            v-if="activeLabs.length === 0"
            class="course-labs-page__empty"
          >
            Активных работ нет.
          </p>
          <div
            v-else
            class="course-labs-page__active-labs"
            :class="{
              'course-labs-page__active-labs--grid': isActiveLabsGrid,
            }"
          >
            <ActiveLabCard
              v-for="lab in activeLabs"
              :key="lab.id"
              :lab="lab"
              :now="now"
              :compact="isActiveLabsGrid"
              @open-variant="openVariant"
              @open-task="openTask"
            />
          </div>
        </section>

        <section
          class="course-labs-page__section"
          aria-labelledby="all-labs-heading"
        >
          <h2
            id="all-labs-heading"
            class="course-labs-page__section-title"
          >
            Все работы дисциплины
          </h2>
          <ul class="course-labs-page__list">
            <li
              v-for="lab in labs"
              :key="lab.id"
            >
              <LabListItem
                :lab="lab"
                :previous-lab-number="getPreviousLabNumber(lab)"
                :now="now"
              />
            </li>
          </ul>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.course-labs-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: var(--page-offset-top) 40px 40px;
}

.course-labs-page__header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 64px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.course-labs-page__back {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.course-labs-page__back:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.course-labs-page__title {
  min-width: 0;
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-labs-page__progress {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0.25em 0.75em;
  border-radius: 1em;
  background-color: var(--color-success-surface);
  color: var(--color-success-text);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.course-labs-page__status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.course-labs-page__status--error {
  color: var(--color-error);
}

.course-labs-page__retry {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.course-labs-page__retry:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.course-labs-page__content {
  display: grid;
  align-items: start;
  gap: 24px;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
}

/* сетке активных работ нужна колонка пошире */
.course-labs-page__content--wide {
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
}

.course-labs-page__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-labs-page__section-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.course-labs-page__active-labs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* не больше двух столбцов; в узкой колонке карточки встают в один */
.course-labs-page__active-labs--grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(max(260px, calc(50% - 8px)), 1fr)
  );
}

.course-labs-page__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.course-labs-page__empty {
  margin: 0;
  padding: 24px 22px;
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

@media (width <= 960px) {
  .course-labs-page__content {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
