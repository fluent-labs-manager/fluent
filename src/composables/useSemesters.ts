import { ref } from 'vue';
import type { Ref } from 'vue';

import { getSemestersStub } from '@/api/semesters.ts';
import type { Semester } from '@/types/course.ts';
import { getApiErrorMessage } from '@/utils/apiError.ts';

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
      error.value = getApiErrorMessage(loadError);
    } finally {
      isLoading.value = false;
    }
  }
  void reload();
  return { semesters, isLoading, error, reload };
}
