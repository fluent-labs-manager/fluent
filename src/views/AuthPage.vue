<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/constants/regex';

const router = useRouter();
const email = ref('');
const password = ref('');
const emailError = ref('');
const passwordError = ref('');

const handleLogin = (): void => {
  emailError.value = '';
  passwordError.value = '';

  if (!email.value) {
    emailError.value = 'Введите email';
  } else if (!EMAIL_REGEX.test(email.value)) {
    emailError.value =
      'Введите корректный email (например, name@university.ru)';
  }

  if (!password.value) {
    passwordError.value = 'Введите пароль';
  } else {
    const errors: string[] = [];
    if (password.value.length < 8) {
      errors.push('минимум 8 символов');
    }
    if (!/[A-Z]/.test(password.value)) {
      errors.push('хотя бы одна заглавная буква');
    }
    if (!/\d/.test(password.value)) {
      errors.push('хотя бы одна цифра');
    }

    if (errors.length > 0) {
      passwordError.value = 'Пароль должен содержать: ' + errors.join(', ');
    } else if (!PASSWORD_REGEX.test(password.value)) {
      passwordError.value = 'Пароль должен содержать буквы и цифры';
    }
  }

  if (emailError.value || passwordError.value) {
    return;
  }

  void router.push({ name: 'home' });
};
</script>

<template>
  <div class="auth-page">
    <!-- заголовок -->
    <div class="brand-header">
      <h1 class="logo">Fluent</h1>
      <p class="subtitle">УЧЕБНАЯ ПЛАТФОРМА</p>
    </div>

    <!-- карточка -->
    <div class="auth-card">
      <h2 class="form-title">Вход в аккаунт</h2>

      <!-- форма -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">ЭЛЕКТРОННАЯ ПОЧТА</label>
          <div class="input-wrapper">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <input
              id="email"
              v-model="email"
              type="text"
              placeholder="corporate@university.ru"
            />
          </div>
          <p v-if="emailError" class="field-error">
            {{ emailError }}
          </p>
        </div>

        <div class="input-group">
          <label for="password">ПАРОЛЬ</label>
          <div class="input-wrapper">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••••••"
            />
          </div>

          <p v-if="passwordError" class="field-error">
            {{ passwordError }}
          </p>
          <div class="forgot-password">
            <router-link to="/forgot-password">Забыли пароль?</router-link>
          </div>
        </div>

        <button type="submit" class="submit-btn">Войти в личный кабинет</button>
      </form>

      <!-- футер карточки -->
      <p class="card-footer">
        Ещё нет аккаунта?
        <router-link to="/register">Создать аккаунт</router-link>
      </p>
    </div>

    <!-- футер страницы -->
    <footer class="page-footer">
      <span>© 2026 FLUENT</span>
      <router-link to="/privacy">Политика конфиденциальности</router-link>
    </footer>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--color-bg);
}

.brand-header {
  margin-bottom: 40px;
  text-align: center;
}

.logo {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-5xl);
  font-weight: 700;
}

.subtitle {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  letter-spacing: 0.1em;
}

.auth-card {
  width: 100%;
  max-width: 465px;
  padding: 36px;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.form-title {
  margin-bottom: 24px;
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: var(--color-text-secondary);
}

input {
  width: 100%;
  padding: 12px 12px 12px 38px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  font-size: var(--font-size-md);
}

input:focus {
  border-color: var(--color-accent);
}

.field-error {
  margin-top: 4px;
  margin-bottom: 0;
  color: var(--color-error);
  font-size: var(--font-size-xs);
}

.forgot-password {
  margin-top: 8px;
  text-align: right;
}

.forgot-password a {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background-color: var(--color-accent);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
}

.card-footer {
  margin-top: 20px;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  text-align: center;
}

.card-footer a {
  color: var(--color-text-secondary);
  font-weight: 600;
  text-decoration: none;
}

.page-footer {
  position: absolute;
  bottom: 24px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 40px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}
</style>
