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

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      courseLabs.value = await getCourseLabsStub(toValue(courseId));
    } catch (loadError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Не удалось загрузить лабораторные работы';
    } finally {
      isLoading.value = false;
    }
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
