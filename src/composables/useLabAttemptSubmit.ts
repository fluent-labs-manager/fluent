import { ref, toValue } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { submitLabAttemptStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseLabAttemptSubmitResult {
  // ход загрузки файла, от 0 до 100
  progress: Ref<number>;
  isSubmitting: Ref<boolean>;
  error: Ref<string | null>;
  // вернёт работу с новой попыткой или null, если отправить не удалось
  submit: (file: File, comment: string | null) => Promise<LabSubmission | null>;
}

export function useLabAttemptSubmit(
  courseId: MaybeRefOrGetter<number>,
  labId: MaybeRefOrGetter<number>,
): UseLabAttemptSubmitResult {
  const progress = ref<number>(0);
  const isSubmitting = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function submit(
    file: File,
    comment: string | null,
  ): Promise<LabSubmission | null> {
    // пока идёт отправка, второй раз работу не отправить
    if (isSubmitting.value) {
      return null;
    }
    isSubmitting.value = true;
    progress.value = 0;
    error.value = null;

    try {
      return await submitLabAttemptStub(
        toValue(courseId),
        toValue(labId),
        file,
        comment,
        (percent) => {
          progress.value = percent;
        },
      );
    } catch (submitError: unknown) {
      // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
      error.value =
        submitError instanceof ApiRequestError
          ? submitError.message
          : 'Неизвестная ошибка';
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }

  return { progress, isSubmitting, error, submit };
}
