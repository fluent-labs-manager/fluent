import { getCurrentScope, onScopeDispose, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { submitLabAttemptStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseLabAttemptSubmitResult {
  // ход загрузки файла, от 0 до 100
  progress: Ref<number>;
  isSubmitting: Ref<boolean>;
  error: Ref<string | null>;
  // вернёт работу с новой попыткой или null, если отправить не удалось,
  // загрузку отменили или, пока файл грузился, открыли другую работу
  submit: (file: File, comment: string | null) => Promise<LabSubmission | null>;
  // прервать загрузку: попытка не создаётся, форму можно отправить снова
  cancel: () => void;
}

export function useLabAttemptSubmit(
  courseId: MaybeRefOrGetter<number>,
  labId: MaybeRefOrGetter<number>,
): UseLabAttemptSubmitResult {
  const progress = ref<number>(0);
  const isSubmitting = ref<boolean>(false);
  const error = ref<string | null>(null);

  // номер последней отправки: прогресс, ошибка и ответ устаревшей отправки
  // не попадут на другую работу
  let lastRequestId = 0;
  let controller: AbortController | null = null;

  // прерывает текущую загрузку и возвращает форму в исходное состояние
  function reset(): void {
    controller?.abort();
    controller = null;
    lastRequestId += 1;
    progress.value = 0;
    isSubmitting.value = false;
    error.value = null;
  }

  function cancel(): void {
    if (isSubmitting.value) {
      reset();
    }
  }

  // страница не пересоздаётся при переходе между работами, поэтому
  // загрузка прошлой работы прерывается
  watch(() => [toValue(courseId), toValue(labId)], reset);

  // ушли со страницы — загрузка больше никому не нужна
  if (getCurrentScope() !== undefined) {
    onScopeDispose(() => {
      controller?.abort();
    });
  }

  async function submit(
    file: File,
    comment: string | null,
  ): Promise<LabSubmission | null> {
    // пока идёт отправка, второй раз работу не отправить
    if (isSubmitting.value) {
      return null;
    }
    lastRequestId += 1;
    const requestId = lastRequestId;
    const isCurrent = (): boolean => requestId === lastRequestId;
    controller = new AbortController();
    isSubmitting.value = true;
    progress.value = 0;
    error.value = null;

    try {
      const result = await submitLabAttemptStub(
        toValue(courseId),
        toValue(labId),
        file,
        comment,
        (percent) => {
          if (isCurrent()) {
            progress.value = percent;
          }
        },
        controller.signal,
      );
      return isCurrent() ? result : null;
    } catch (submitError: unknown) {
      if (isCurrent()) {
        // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
        error.value =
          submitError instanceof ApiRequestError
            ? submitError.message
            : 'Неизвестная ошибка';
      }
      return null;
    } finally {
      if (isCurrent()) {
        isSubmitting.value = false;
        controller = null;
      }
    }
  }

  return { progress, isSubmitting, error, submit, cancel };
}
