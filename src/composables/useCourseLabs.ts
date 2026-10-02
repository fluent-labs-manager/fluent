import { ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { getCourseLabsStub } from '@/api/labs/LabsApi.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseCourseLabsResult {
  courseLabs: Ref<CourseLabs | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

export function useCourseLabs(
  courseId: MaybeRefOrGetter<number>,
): UseCourseLabsResult {
  const courseLabs = ref<CourseLabs | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  // номер последнего запроса: ответ на устаревший запрос не перезапишет данные
  let lastRequestId = 0;

  async function reload(): Promise<void> {
    lastRequestId += 1;
    const requestId = lastRequestId;
    isLoading.value = true;
    error.value = null;

    let data: CourseLabs | null = null;
    let message: string | null = null;
    try {
      data = await getCourseLabsStub(toValue(courseId));
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      message =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Не удалось загрузить лабораторные работы';
    }

    if (requestId !== lastRequestId) {
      return;
    }
    courseLabs.value = data;
    error.value = message;
    isLoading.value = false;
  }

  // страница не пересоздаётся при переходе между дисциплинами, поэтому
  // данные перезагружаются при смене courseId
  watch(
    () => toValue(courseId),
    () => {
      void reload();
    },
    { immediate: true },
  );

  return { courseLabs, isLoading, error, reload };
}
