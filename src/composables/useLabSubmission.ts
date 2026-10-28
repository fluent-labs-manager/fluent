import { ref } from 'vue';
import type { Ref } from 'vue';
import { getLabSubmissionStub, submitLabWorkStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmissionDetails } from '@/api/labs/LabSubmission.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseLabSubmissionResult {
  submission: Ref<LabSubmissionDetails | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
  submitWork: (comment: string) => Promise<void>;
}

export function useLabSubmission(labId: number): UseLabSubmissionResult {
  const submission = ref<LabSubmissionDetails | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      submission.value = await getLabSubmissionStub(labId);
    } catch (loadError: unknown) {
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Неизвестная ошибка';
    } finally {
      isLoading.value = false;
    }
  }

  async function submitWork(comment: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await submitLabWorkStub(labId, comment);
      if (submission.value !== null) {
        submission.value.status = 'in_review';
        submission.value.studentComment = comment;
      }
    } catch (submitError: unknown) {
      error.value =
        submitError instanceof ApiRequestError
          ? submitError.message
          : 'Не удалось отправить работу';
    } finally {
      isLoading.value = false;
    }
  }

  void reload();

  return { submission, isLoading, error, reload, submitWork };
}
