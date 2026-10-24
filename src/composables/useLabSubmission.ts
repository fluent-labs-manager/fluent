import { ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { getLabSubmissionStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseLabSubmissionResult {
  submission: Ref<LabSubmission | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

export function useLabSubmission(
  courseId: MaybeRefOrGetter<number>,
  labId: MaybeRefOrGetter<number>,
): UseLabSubmissionResult {
  const submission = ref<LabSubmission | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  // номер последнего запроса: ответ на устаревший запрос не перезапишет данные
  let lastRequestId = 0;

  async function reload(): Promise<void> {
    lastRequestId += 1;
    const requestId = lastRequestId;
    isLoading.value = true;
    error.value = null;

    let data: LabSubmission | null = null;
    let message: string | null = null;
    try {
      data = await getLabSubmissionStub(toValue(courseId), toValue(labId));
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
    submission.value = data;
    error.value = message;
    isLoading.value = false;
  }

  // страница не пересоздаётся при переходе между работами, поэтому
  // данные перезагружаются при смене courseId или labId
  watch(
    () => [toValue(courseId), toValue(labId)],
    () => {
      void reload();
    },
    { immediate: true },
  );

  return { submission, isLoading, error, reload };
}
