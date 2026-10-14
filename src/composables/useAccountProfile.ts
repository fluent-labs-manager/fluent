import { ref } from 'vue';
import type { Ref } from 'vue';

import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import type { AccountProfile } from '@/api/account/AccountProfile.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseAccountProfileResult {
  profile: Ref<AccountProfile | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

// данные личного кабинета текущего пользователя
export function useAccountProfile(): UseAccountProfileResult {
  const profile = ref<AccountProfile | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      profile.value = await getAccountProfileStub();
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Неизвестная ошибка';
    } finally {
      isLoading.value = false;
    }
  }
  void reload();
  return { profile, isLoading, error, reload };
}
