import { ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { getCourseGradebookStub } from '@/api/gradebook/GradebookApi.ts';
import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseCourseGradebookResult {
  gradebook: Ref<CourseGradebook | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

// courseId — null, пока преподаватель не выбрал дисциплину: тогда ничего не грузим
export function useCourseGradebook(
  courseId: MaybeRefOrGetter<number | null>,
): UseCourseGradebookResult {
  const gradebook = ref<CourseGradebook | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // номер последнего запроса: ответ на устаревший запрос не перезапишет данные
  let lastRequestId = 0;

  async function reload(): Promise<void> {
    lastRequestId += 1;
    const requestId = lastRequestId;
    const id = toValue(courseId);
    gradebook.value = null;
    error.value = null;

    if (id === null) {
      isLoading.value = false;
      return;
    }
    isLoading.value = true;

    let data: CourseGradebook | null = null;
    let message: string | null = null;
    try {
      data = await getCourseGradebookStub(id);
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      message =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Неизвестная ошибка';
    }

    if (requestId !== lastRequestId) {
      return;
    }
    gradebook.value = data;
    error.value = message;
    isLoading.value = false;
  }

  watch(
    () => toValue(courseId),
    () => {
      void reload();
    },
    { immediate: true },
  );

  return { gradebook, isLoading, error, reload };
}
