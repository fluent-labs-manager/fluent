<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

type Role = 'student' | 'teacher';

const selectedRole = ref<Role>('student');
const fullName = ref('');
const fullNameError = ref('');

const goToNext = (): void => {
  fullNameError.value = '';

  if (!fullName.value.trim()) {
    fullNameError.value = 'Введите ФИО';
    return;
  }

  void router.push({
    name: 'registration-details',
    query: { role: selectedRole.value },
  });
};

const handleClose = (): void => {
  void router.push({ name: 'auth' });
};
</script>

<template>
  <div class="registration-page">
    <aside class="sidebar">
      <div class="sidebar-content">
        <h1 class="sidebar-logo">FLUENT</h1>
        <p class="sidebar-subtitle">СОЗДАНИЕ АККАУНТА</p>

        <ul class="steps">
          <li class="step step--active">
            <span class="step-number">1</span>
            <span class="step-label">Роль и имя</span>
          </li>
          <li class="step">
            <span class="step-number">2</span>
            <span class="step-label">Детали профиля</span>
          </li>
        </ul>
      </div>
    </aside>

    <main class="content">
      <div class="content-inner">
        <header class="content-header">
          <span class="step-indicator">ШАГ 1 ИЗ 2</span>
          <button
            class="close-btn"
            type="button"
            aria-label="Закрыть"
            @click="handleClose"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <h2 class="title">Регистрация</h2>
        <p class="description">
          Для персонализации личного кабинета выберите вашу основную роль в
          системе.
        </p>

        <div class="role-selection">
          <div
            class="role-option"
            :class="{ 'role-option--selected': selectedRole === 'student' }"
            @click="selectedRole = 'student'"
          >
            <div class="role-option__content">
              <h3 class="role-option__title">Я студент</h3>
              <p class="role-option__desc">
                Сдача лабораторных, расписание, варианты заданий и просмотр
                баллов.
              </p>
            </div>
            <div class="role-option__check">
              <svg
                v-if="selectedRole === 'student'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
          </div>

          <div
            class="role-option"
            :class="{ 'role-option--selected': selectedRole === 'teacher' }"
            @click="selectedRole = 'teacher'"
          >
            <div class="role-option__content">
              <h3 class="role-option__title">Я преподаватель</h3>
              <p class="role-option__desc">
                Управление группами, генерация вариантов заданий, оценка и
                рецензирование работ.
              </p>
            </div>
            <div class="role-option__check">
              <svg
                v-if="selectedRole === 'teacher'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="field">
          <label
            class="field-label"
            for="fullName"
            >ФИО ПОЛНОСТЬЮ</label
          >
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': fullNameError }"
            @input="fullNameError = ''"
          />
          <p
            v-if="fullNameError"
            class="field-error"
          >
            {{ fullNameError }}
          </p>
        </div>

        <button
          class="submit-btn"
          type="button"
          @click="goToNext"
        >
          Продолжить настройку
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.registration-page {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex-shrink: 0;
  width: 23.75rem;
  padding: 3.5rem 3rem;
  background-color: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
}

.sidebar-logo {
  margin: 0;
  font-size: var(--font-size-4xl);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.sidebar-subtitle {
  margin-top: 0.75rem;
  margin-bottom: 2.5rem;
  color: rgb(255 255 255 / 85%);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.step-number {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  background-color: rgb(255 255 255 / 15%);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.step--active .step-number {
  background-color: #fff;
  color: var(--color-sidebar-bg);
}

.step-label {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.step:not(.step--active) .step-label {
  color: rgb(255 255 255 / 65%);
}

.content {
  flex: 1;
  padding: 3.5rem 3rem 3.5rem 6rem;
  background-color: var(--color-page-bg-soft);
  overflow-y: auto;
}

.content-inner {
  max-width: 54.25rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.step-indicator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
}

.close-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.875rem;
  height: 1.875rem;
  padding: 0;
  border: 1px solid var(--color-close-border);
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.close-btn:hover {
  background-color: rgb(0 0 0 / 4%);
}

.close-btn svg {
  width: 0.9375rem;
  height: 0.9375rem;
}

.title {
  margin: 0 0 0.75rem;
  color: var(--color-text);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.description {
  margin: 0 0 2.5rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.role-selection {
  display: grid;
  gap: 1.125rem;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 2rem;
}

.role-option {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--color-role-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  cursor: pointer;
  transition: all 0.15s ease;
}

.role-option:hover {
  border-color: var(--color-role-border-hover);
}

.role-option--selected {
  background-color: var(--color-role-selected-bg);
  border-color: var(--color-role-selected-border);
}

.role-option__content {
  flex: 1;
}

.role-option__title {
  margin: 0 0 0.5rem;
  color: var(--color-text);
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.role-option__desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.role-option__check {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1.5px solid var(--color-role-border);
  border-radius: 50%;
  background-color: transparent;
  color: #fff;
}

.role-option--selected .role-option__check {
  background-color: var(--color-role-check-bg);
  border-color: var(--color-role-check-bg);
}

.role-option__check svg {
  width: 1rem;
  height: 1rem;
}

.field {
  max-width: 38.75rem;
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.field-input {
  width: 100%;
  padding: 0.9375rem 1rem;
  border: 1px solid var(--color-role-border);
  border-radius: 0.75rem;
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-md);
  transition: border-color 0.15s ease;
}

.field-input:focus {
  border-color: var(--color-role-selected-border);
}

.field-input--error {
  border-color: var(--color-error);
}

.field-error {
  margin-top: 0.25rem;
  margin-bottom: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.submit-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: var(--color-btn-primary-hover);
}
</style>
