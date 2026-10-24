<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { ChevronLeft } from '@lucide/vue';

defineProps<{
  courseId: number;
  labId: number;
}>();
</script>

<template>
  <main class="lab-submission-page">
    <!-- возвращает к дисциплине с этой же работой в карточке -->
    <RouterLink
      class="lab-submission-page__back"
      :to="{
        name: 'course-labs',
        params: { courseId },
        query: { lab: String(labId) },
      }"
    >
      <ChevronLeft :size="16" />
      Назад
    </RouterLink>

    <h1 class="lab-submission-page__title">Лабораторная работа</h1>
    <p class="lab-submission-page__description">Раздел в разработке.</p>
  </main>
</template>

<style scoped>
.lab-submission-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.lab-submission-page__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  text-decoration: none;
  transition: color 0.2s ease;
}

.lab-submission-page__back:hover {
  color: var(--color-text);
}

.lab-submission-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.lab-submission-page__description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
}
</style>
