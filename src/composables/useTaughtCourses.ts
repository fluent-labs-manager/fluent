import { ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { getTaughtCoursesStub } from '@/api/teaching/TeachingApi.ts';
import type { TaughtCourse } from '@/api/teaching/TaughtCourse.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseTaughtCoursesResult {
  courses: Ref<TaughtCourse[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

// enabled — грузить ли данные: дисциплины есть только у преподавателя
export function useTaughtCourses(
  enabled: MaybeRefOrGetter<boolean> = true,
): UseTaughtCoursesResult {
  const courses = ref<TaughtCourse[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      courses.value = await getTaughtCoursesStub();
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
    () => toValue(enabled),
    (isEnabled) => {
      if (isEnabled) {
        void reload();
      }
    },
    { immediate: true },
  );

  return { courses, isLoading, error, reload };
}
