import { ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import type { AccountProfile } from '@/api/account/AccountProfile.dto.ts';
import type { UserRole } from '@/types/UserRole.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseAccountProfileResult {
  profile: Ref<AccountProfile | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

// данные личного кабинета. Роль известна только после загрузки пользователя,
// поэтому запрос уходит, когда она появится, и повторяется при её смене
export function useAccountProfile(
  role: MaybeRefOrGetter<UserRole | null>,
): UseAccountProfileResult {
  const profile = ref<AccountProfile | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    const currentRole = toValue(role);
    if (currentRole === null) {
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      profile.value = await getAccountProfileStub(currentRole);
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

  watch(
    () => toValue(role),
    () => {
      void reload();
    },
    { immediate: true },
  );

  return { profile, isLoading, error, reload };
}
