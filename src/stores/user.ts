import { ref } from 'vue';
import { defineStore } from 'pinia';

import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import type { User } from '@/api/users/User.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// придёт авторизация через ITMO ID.
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // повторный вызов из нескольких мест не отправит второй запрос.
  async function loadUser(): Promise<void> {
    if (user.value !== null || isLoading.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      user.value = await getCurrentUserStub();
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Не удалось загрузить пользователя';
    } finally {
      isLoading.value = false;
    }
  }

  return { user, isLoading, error, loadUser };
});
