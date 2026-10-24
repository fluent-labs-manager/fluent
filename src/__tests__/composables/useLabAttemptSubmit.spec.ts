import { beforeEach, describe, expect, it, vi } from 'vitest';

import { nextTick, ref } from 'vue';

import { submitLabAttemptStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { useLabAttemptSubmit } from '@/composables/useLabAttemptSubmit.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { labSubmissionFixture } from '../fixtures.ts';

vi.mock('@/api/labs/LabsApi.ts', () => ({ submitLabAttemptStub: vi.fn() }));

const mockedSubmit = vi.mocked(submitLabAttemptStub);

const file = new File(['%PDF'], 'otchet.pdf');

describe('useLabAttemptSubmit', () => {
  beforeEach(() => {
    mockedSubmit.mockReset();
  });

  it('передаёт ход загрузки и возвращает работу с новой попыткой', async () => {
    let finish: (data: LabSubmission) => void = () => undefined;
    mockedSubmit.mockImplementation(
      (_courseId, _labId, _file, _comment, onProgress) => {
        onProgress?.(60);
        return new Promise<LabSubmission>((resolve) => {
          finish = resolve;
        });
      },
    );
    const { progress, isSubmitting, submit } = useLabAttemptSubmit(11, 2);

    const result = submit(file, 'Комментарий');

    expect(mockedSubmit).toHaveBeenCalledWith(
      11,
      2,
      file,
      'Комментарий',
      expect.any(Function),
    );
    expect(isSubmitting.value).toBe(true);
    expect(progress.value).toBe(60);

    finish(labSubmissionFixture);

    expect(await result).toEqual(labSubmissionFixture);
    expect(isSubmitting.value).toBe(false);
  });

  it('пока идёт отправка, повторный вызов ничего не отправляет', async () => {
    let finish: (data: LabSubmission) => void = () => undefined;
    mockedSubmit.mockReturnValue(
      new Promise<LabSubmission>((resolve) => {
        finish = resolve;
      }),
    );
    const { submit } = useLabAttemptSubmit(11, 2);

    const first = submit(file, null);
    const second = await submit(file, null);
    finish(labSubmissionFixture);
    await first;

    expect(second).toBeNull();
    expect(mockedSubmit).toHaveBeenCalledTimes(1);
  });

  it('новая отправка начинает прогресс с нуля и сбрасывает прошлую ошибку', async () => {
    mockedSubmit.mockRejectedValueOnce(new ApiRequestError(503, 'Сбой'));
    const { progress, error, submit } = useLabAttemptSubmit(11, 2);
    progress.value = 80;

    expect(await submit(file, null)).toBeNull();
    expect(error.value).toBe('Сбой');
    expect(progress.value).toBe(0);

    mockedSubmit.mockResolvedValueOnce(labSubmissionFixture);
    await submit(file, null);

    expect(error.value).toBeNull();
  });

  it('при неизвестной ошибке пишет «Неизвестная ошибка»', async () => {
    mockedSubmit.mockRejectedValueOnce(new Error('сбой'));
    const { error, isSubmitting, submit } = useLabAttemptSubmit(11, 2);

    await submit(file, null);

    expect(error.value).toBe('Неизвестная ошибка');
    expect(isSubmitting.value).toBe(false);
  });

  it('при смене работы во время отправки сбрасывает состояние и не отдаёт ответ', async () => {
    let finish: (data: LabSubmission) => void = () => undefined;
    let reportProgress: (percent: number) => void = () => undefined;
    mockedSubmit.mockImplementation(
      (_courseId, _labId, _file, _comment, onProgress) =>
        new Promise<LabSubmission>((resolve) => {
          finish = resolve;
          reportProgress = (percent): void => {
            onProgress?.(percent);
          };
        }),
    );
    const labId = ref(2);
    const { progress, isSubmitting, submit } = useLabAttemptSubmit(11, labId);

    const result = submit(file, null);
    reportProgress(40);
    labId.value = 4;
    await nextTick();

    expect(isSubmitting.value).toBe(false);
    expect(progress.value).toBe(0);

    reportProgress(80);
    finish(labSubmissionFixture);

    expect(await result).toBeNull();
    expect(progress.value).toBe(0);
    expect(isSubmitting.value).toBe(false);
  });

  it('ошибка отправки прошлой работы не попадает на новую', async () => {
    let fail: (error: unknown) => void = () => undefined;
    mockedSubmit.mockReturnValue(
      new Promise<LabSubmission>((_resolve, reject) => {
        fail = reject;
      }),
    );
    const labId = ref(2);
    const { error, submit } = useLabAttemptSubmit(11, labId);

    const result = submit(file, null);
    labId.value = 4;
    await nextTick();
    fail(new ApiRequestError(500, 'Загрузка файла прервалась'));
    await result;

    expect(error.value).toBeNull();
  });
});
