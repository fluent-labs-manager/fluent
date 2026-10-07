<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

type Role = 'student' | 'teacher';

const selectedRole = ref<Role>('student');
const fullName = ref('Александр Павлов');
const fullNameError = ref('');

const goToNext = (): void => {
  fullNameError.value = '';

  if (!fullName.value.trim()) {
    fullNameError.value = 'Введите ФИО';
    return;
  }

  void router.push({ name: 'registration-details' });
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
          <button class="close-btn" aria-label="Закрыть">
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
          <label class="field-label" for="fullName">ФИО ПОЛНОСТЬЮ</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': fullNameError }"
            @input="fullNameError = ''"
          />
          <p v-if="fullNameError" class="field-error">
            {{ fullNameError }}
          </p>
        </div>

        <button class="submit-btn" @click="goToNext">
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
  width: 380px;
  padding: 56px 48px;
  background-color: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
  flex-shrink: 0;
}

.sidebar-logo {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.sidebar-subtitle {
  margin-top: 12px;
  margin-bottom: 40px;
  color: rgb(255 255 255 / 85%);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  gap: 14px;
}

.step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgb(255 255 255 / 15%);
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step--active .step-number {
  background-color: #fff;
  color: var(--color-sidebar-bg);
}

.step-label {
  font-size: 14px;
  font-weight: 500;
}

.step:not(.step--active) .step-label {
  color: rgb(255 255 255 / 65%);
}

.content {
  flex: 1;
  padding: 56px 48px 56px 96px;
  background-color: var(--color-page-bg-soft);
  overflow-y: auto;
}

.content-inner {
  max-width: 868px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.step-indicator {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.close-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
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
  width: 15px;
  height: 15px;
}

.title {
  margin: 0 0 12px;
  color: var(--color-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.1;
}

.description {
  margin: 0 0 40px;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.role-selection {
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 32px;
}

.role-option {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-role-border);
  border-radius: 16px;
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
  margin: 0 0 8px;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 700;
}

.role-option__desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.role-option__check {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border: 1.5px solid var(--color-role-border);
  border-radius: 50%;
  background-color: transparent;
  color: #fff;
  flex-shrink: 0;
}

.role-option--selected .role-option__check {
  background-color: var(--color-role-check-bg);
  border-color: var(--color-role-check-bg);
}

.role-option__check svg {
  width: 16px;
  height: 16px;
}

.field {
  max-width: 620px;
  margin-bottom: 24px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.field-input {
  width: 100%;
  padding: 15px 16px;
  border: 1px solid var(--color-role-border);
  border-radius: 12px;
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.field-input:focus {
  border-color: var(--color-role-selected-border);
}

.field-input--error {
  border-color: var(--color-error);
}

.field-error {
  margin-top: 4px;
  margin-bottom: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.submit-btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: var(--color-btn-primary-hover);
}
</style>
