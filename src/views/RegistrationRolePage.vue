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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <h2 class="title">Регистрация</h2>
        <p class="description">
          Для персонализации личного кабинета выберите вашу основную роль в системе.
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
                Сдача лабораторных, расписание, варианты заданий и просмотр баллов.
              </p>
            </div>
            <div class="role-option__check">
              <svg v-if="selectedRole === 'student'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                Управление группами, генерация вариантов заданий, оценка и рецензирование работ.
              </p>
            </div>
            <div class="role-option__check">
              <svg v-if="selectedRole === 'teacher'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <p v-if="fullNameError" class="field-error">{{ fullNameError }}</p>
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
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 380px;
  flex-shrink: 0;
  background-color: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
  padding: 56px 48px;
}

.sidebar-logo {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0;
}

.sidebar-subtitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  margin-top: 12px;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.85);
}

.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 14px;
}

.step-number {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step--active .step-number {
  background-color: #ffffff;
  color: var(--color-sidebar-bg);
}

.step-label {
  font-size: 14px;
  font-weight: 500;
}

.step:not(.step--active) .step-label {
  color: rgba(255, 255, 255, 0.65);
}

.content {
  flex: 1;
  background-color: var(--color-page-bg-soft);
  padding: 56px 48px 56px 96px;
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
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--color-close-border);
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.15s ease;
}
.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.close-btn svg {
  width: 15px;
  height: 15px;
}

.title {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px;
  line-height: 1.1;
}

.description {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 40px;
}

.role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 32px;
}

.role-option {
  background-color: var(--color-surface);
  border: 1px solid var(--color-role-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
}

.role-option__desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
}

.role-option__check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--color-role-border);
  background-color: transparent;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
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
  margin-bottom: 24px;
  max-width: 620px;
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.field-input {
  width: 100%;
  padding: 15px 16px;
  border: 1px solid var(--color-role-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s ease;
}

.field-input:focus {
  border-color: var(--color-role-selected-border);
}

.field-input--error {
  border-color: var(--color-error);
}

.field-error {
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: 4px;
  margin-bottom: 0;
}

.submit-btn {
  padding: 16px 32px;
  background-color: var(--color-btn-primary);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: var(--color-btn-primary-hover);
}
</style>
