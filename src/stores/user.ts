import { ref } from 'vue';
import { defineStore } from 'pinia';

import { getCurrentUserStub } from '@/api/user.ts';
import type { User } from '@/types/course.ts';
import { getApiErrorMessage } from '@/utils/apiError.ts';

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
      error.value = getApiErrorMessage(loadError);
    } finally {
      isLoading.value = false;
    }
  }

  return { user, isLoading, error, loadUser };
});
