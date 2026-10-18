<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EMAIL_REGEX } from '@/constants/regex';

const router = useRouter();
const route = useRoute();

const role = computed<'student' | 'teacher'>(() => {
  return route.query.role === 'teacher' ? 'teacher' : 'student';
});

const university = ref('');
const academicGroupOrDept = ref('');
const corporateEmail = ref('');
const verificationCode = ref('');

const isCodeSent = ref(false);
const universityError = ref('');
const groupOrDeptError = ref('');
const codeError = ref('');
const emailError = ref('');

const handleSendCode = (): void => {
  emailError.value = '';

  const trimmedEmail = corporateEmail.value.trim();
  if (!trimmedEmail) {
    emailError.value = 'Введите email';
    return;
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    emailError.value =
      'Введите корректный email (например, name@university.ru)';
    return;
  }

  isCodeSent.value = true;
};

const handleCompleteRegistration = (): void => {
  universityError.value = '';
  groupOrDeptError.value = '';
  codeError.value = '';
  emailError.value = '';

  let hasError = false;

  if (!university.value.trim()) {
    universityError.value = 'Укажите ВУЗ';
    hasError = true;
  }

  if (!academicGroupOrDept.value.trim()) {
    groupOrDeptError.value =
      role.value === 'teacher' ? 'Укажите кафедру' : 'Укажите группу';
    hasError = true;
  }

  const trimmedEmail = corporateEmail.value.trim();
  if (!trimmedEmail) {
    emailError.value = 'Введите email';
    hasError = true;
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    emailError.value =
      'Введите корректный email (например, name@university.ru)';
    hasError = true;
  }

  const trimmedCode = verificationCode.value.trim();
  const digitsOnlyRegex = /^\d{6}$/;

  if (!trimmedCode) {
    codeError.value = 'Введите 6-значный код';
    hasError = true;
  } else if (!digitsOnlyRegex.test(trimmedCode)) {
    codeError.value = 'Код должен состоять ровно из 6 цифр';
    hasError = true;
  }

  if (hasError) {
    return;
  }

  void router.push({ name: 'home' });
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
          <li class="step step--completed">
            <span class="step-number">
              <svg
                class="step-check-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span class="step-label">Роль и имя</span>
          </li>
          <li class="step step--active">
            <span class="step-number">2</span>
            <span class="step-label">Детали профиля</span>
          </li>
        </ul>
      </div>
    </aside>

    <main class="content">
      <div class="content-inner">
        <header class="content-header">
          <span class="step-indicator">ШАГ 2 ИЗ 2</span>
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

        <h2 class="title">Детали профиля</h2>
        <p class="description">
          Укажите академические данные для завершения настройки аккаунта Fluent.
        </p>

        <form
          class="details-form"
          novalidate
          @submit.prevent="handleCompleteRegistration"
        >
          <div class="form-columns">
            <div class="field">
              <label
                class="field-label"
                for="university"
              >
                УЧЕБНОЕ ЗАВЕДЕНИЕ (ВУЗ)
              </label>
              <input
                id="university"
                v-model="university"
                type="text"
                class="field-input"
                :class="{ 'field-input--error': universityError }"
                placeholder="ITMO"
                @input="universityError = ''"
              />
              <p
                v-if="universityError"
                class="field-error"
              >
                {{ universityError }}
              </p>
            </div>

            <div class="field">
              <label
                class="field-label"
                for="groupOrDept"
              >
                {{
                  role === 'teacher'
                    ? 'КАФЕДРА / ФАКУЛЬТЕТ'
                    : 'АКАДЕМИЧЕСКАЯ ГРУППА'
                }}
              </label>
              <input
                id="groupOrDept"
                v-model="academicGroupOrDept"
                type="text"
                class="field-input"
                :class="{ 'field-input--error': groupOrDeptError }"
                :placeholder="role === 'teacher' ? 'Кафедра ВТ' : 'P3322'"
                @input="groupOrDeptError = ''"
              />
              <p
                v-if="groupOrDeptError"
                class="field-error"
              >
                {{ groupOrDeptError }}
              </p>
            </div>

            <div class="field">
              <label
                class="field-label"
                for="verificationCode"
              >
                КОД ПОДТВЕРЖДЕНИЯ
              </label>
              <input
                id="verificationCode"
                v-model="verificationCode"
                type="text"
                class="field-input"
                :class="{ 'field-input--error': codeError }"
                placeholder="Введите 6-значный код"
                maxlength="6"
                inputmode="numeric"
                @input="codeError = ''"
              />
              <p
                v-if="codeError"
                class="field-error"
              >
                {{ codeError }}
              </p>
            </div>

            <div class="field">
              <label
                class="field-label"
                for="corporateEmail"
              >
                ПОДТВЕРЖДЕНИЕ КОРПОРАТИВНОЙ ПОЧТЫ
              </label>
              <div class="verification-row">
                <input
                  id="corporateEmail"
                  v-model="corporateEmail"
                  type="text"
                  class="field-input verification-input"
                  :class="{ 'field-input--error': emailError }"
                  placeholder="465591@niuitmo.ru"
                  @input="emailError = ''"
                />
                <button
                  class="code-btn"
                  type="button"
                  @click="handleSendCode"
                >
                  Код
                </button>
              </div>
              <p
                v-if="emailError"
                class="field-error"
              >
                {{ emailError }}
              </p>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="submit-btn"
              type="submit"
            >
              Завершить регистрацию
            </button>
          </div>
        </form>
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

.step--completed .step-number {
  background-color: rgb(255 255 255 / 25%);
  color: #fff;
}

.step-check-icon {
  width: 1rem;
  height: 1rem;
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
  max-width: 56.5rem;
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

.details-form {
  display: flex;
  flex-direction: column;
}

.form-columns {
  display: grid;
  gap: 1rem 1.25rem;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
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

.verification-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.verification-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  width: 5.75rem;
  height: 3rem;
  padding: 0 1rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.code-btn:hover {
  background-color: var(--color-btn-primary-hover);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  width: 17.5rem;
  height: 2.875rem;
  padding: 0 1rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: var(--color-btn-primary-hover);
}

.field-error {
  margin-top: 0.25rem;
  margin-bottom: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}
</style>
