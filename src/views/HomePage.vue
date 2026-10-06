<script setup lang="ts"></script>

<template>
  <main class="home-page">
    <h1 class="home-page__title">Главная</h1>
    <p class="home-page__description">Раздел в разработке.</p>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.home-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.home-page__description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
}
</style>
