<script setup lang="ts"></script>

<template>
  <main class="score-builder-page">
    <h1 class="score-builder-page__title">Конструктор баллов</h1>
    <p class="score-builder-page__description">Раздел в разработке.</p>
  </main>
</template>

<style scoped>
.score-builder-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.score-builder-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.score-builder-page__description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
}
</style>
