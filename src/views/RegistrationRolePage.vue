<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToNext = (): void => {
  void router.push({ name: 'registration-details' });
};
</script>

<template>
  <div class="registration-page">
    <div class="auth-card">
      <h2 class="form-title">Регистрация</h2>
      <p>Шаг 1 из 2: Выбор роли</p>

      <div class="role-option">
        <h3>Я студент</h3>
      </div>
      <div class="role-option">
        <h3>Я преподаватель</h3>
      </div>

      <button
        class="submit-btn"
        @click="goToNext"
      >
        Продолжить настройку
      </button>
    </div>
  </div>
</template>

<style scoped>
.registration-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
}
.auth-card {
  width: 465px;
  background: var(--color-surface);
  padding: 36px;
  border-radius: 16px;
}
.role-option {
  border: 1px solid var(--color-border);
  padding: 16px;
  margin: 12px 0;
  border-radius: 8px;
}
.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
