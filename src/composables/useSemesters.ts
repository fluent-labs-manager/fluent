import { ref } from 'vue';
import type { Ref } from 'vue';

import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import type { Semester } from '@/api/semesters/Semester.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseSemestersResult {
  semesters: Ref<Semester[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

export function useSemesters(): UseSemestersResult {
  const semesters = ref<Semester[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      semesters.value = await getSemestersStub();
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Не удалось загрузить дисциплины';
    } finally {
      isLoading.value = false;
    }
  }
  void reload();
  return { semesters, isLoading, error, reload };
}
