import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getLabSubmissionStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// проверяем режимы заглушки и поиск работы по адресу страницы
describe('getLabSubmissionStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function request(
    courseId: number,
    labId: number,
    search = '',
  ): Promise<unknown> {
    window.history.replaceState(
      null,
      '',
      `/courses/${String(courseId)}/labs/${String(labId)}${search}`,
    );
    const settled = getLabSubmissionStub(courseId, labId).then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('возвращает работу дисциплины с попытками по порядку', async () => {
    const result = (await request(1, 102)) as LabSubmission;

    expect(result.course.id).toBe(1);
    expect(result.lab.id).toBe(102);
    expect(result.attempts.map((attempt) => attempt.number)).toEqual([1, 2]);
  });

  it('у работы без попыток возвращает пустую историю', async () => {
    const result = (await request(1, 103)) as LabSubmission;

    expect(result.attempts).toEqual([]);
  });

  it('работу чужой дисциплины не находит', async () => {
    const error = await request(1, 202);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).message).toBe('Работа не найдена');
  });

  it('без дисциплины отвечает 404', async () => {
    const error = await request(999, 102);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).message).toBe('Дисциплина не найдена');
  });

  it('с ?mock=error бросает ApiRequestError, как ApiResolver', async () => {
    expect(await request(1, 102, '?mock=error')).toBeInstanceOf(
      ApiRequestError,
    );
  });
});

// заглушка меняет моки, поэтому каждый тест загружает модули заново
describe('submitLabAttemptStub', () => {
  type LabsApi = typeof import('@/api/labs/LabsApi.ts');
  let api: LabsApi;
  // класс ошибки тоже загружается заново — instanceof сверяем с ним
  let SubmitError: typeof ApiRequestError;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });
    vi.setSystemTime(new Date('2026-10-24T16:40:00+03:00'));
    api = await import('@/api/labs/LabsApi.ts');
    SubmitError = (await import('@/utils/ApiResolver.ts')).ApiRequestError;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  const file = new File(['%PDF'], 'gorelova_v3.pdf');

  // отправка с ожиданием всей имитации загрузки; ошибка возвращается значением
  async function submit(
    courseId: number,
    labId: number,
    onProgress?: (percent: number) => void,
  ): Promise<unknown> {
    const settled = api
      .submitLabAttemptStub(
        courseId,
        labId,
        file,
        'Исправил формы.',
        onProgress,
      )
      .then(
        (value) => value,
        (error: unknown) => error,
      );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('сообщает ход загрузки до 100%', async () => {
    const progress: number[] = [];

    await submit(1, 102, (percent) => {
      progress.push(percent);
    });

    expect(progress).toEqual([20, 40, 60, 80, 100]);
  });

  it('после возврата работы попытка получает следующий номер', async () => {
    const result = (await submit(1, 102)) as LabSubmission;
    const attempt = result.attempts.at(-1);

    expect(result.lab.status).toBe(LabStatus.PendingReview);
    expect(result.attempts).toHaveLength(3);
    expect(attempt).toMatchObject({
      number: 3,
      file: { name: 'gorelova_v3.pdf', size: file.size },
      comment: 'Исправил формы.',
      teacherComment: null,
      result: AttemptResult.Pending,
    });
    // время отправки — момент окончания загрузки
    expect(attempt?.submittedAt).toBe(new Date().toISOString());
  });

  it('у работы без попыток первая попытка — номер 1', async () => {
    const result = (await submit(2, 203)) as LabSubmission;

    expect(result.attempts.map((attempt) => attempt.number)).toEqual([1]);
  });

  it('новый статус виден на странице дисциплины и странице работы', async () => {
    await submit(1, 102);

    const labsPromise = api.getCourseLabsStub(1);
    const submissionPromise = api.getLabSubmissionStub(1, 102);
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    const { labs } = await labsPromise;
    const submission = await submissionPromise;

    expect(labs.find((lab) => lab.id === 102)?.status).toBe(
      LabStatus.PendingReview,
    );
    expect(submission.attempts).toHaveLength(3);
  });

  it('второй раз ту же работу не отправить', async () => {
    await submit(1, 102);
    const error = await submit(1, 102);

    expect(error).toBeInstanceOf(SubmitError);
    expect((error as ApiRequestError).message).toBe(
      'Работу сейчас нельзя отправить',
    );
  });

  it('недоступную работу не отправить', async () => {
    expect(await submit(1, 103)).toBeInstanceOf(SubmitError);
  });

  it('несуществующую работу не находит', async () => {
    const error = await submit(1, 999);

    expect((error as ApiRequestError).message).toBe('Работа не найдена');
  });

  it('с ?mock=error бросает ApiRequestError', async () => {
    window.history.replaceState(null, '', '/courses/1/labs/102?mock=error');

    expect(await submit(1, 102)).toBeInstanceOf(SubmitError);
  });

  it('отменённая загрузка обрывается и ничего не создаёт', async () => {
    const controller = new AbortController();
    const progress: number[] = [];
    const settled = api
      .submitLabAttemptStub(
        1,
        102,
        file,
        null,
        (percent) => {
          progress.push(percent);
          if (percent === 40) {
            controller.abort();
          }
        },
        controller.signal,
      )
      .then(
        (value) => value,
        (error: unknown) => error,
      );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    const error = await settled;

    // отменённый запрос отличают по имени ошибки, как у fetch
    expect((error as Error).name).toBe('AbortError');
    expect(progress).toEqual([20, 40]);

    const submissionPromise = api.getLabSubmissionStub(1, 102);
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    const submission = await submissionPromise;
    expect(submission.lab.status).toBe(LabStatus.NotSubmitted);
    expect(submission.attempts).toHaveLength(2);
  });

  it('с ?mock=upload-error первая загрузка обрывается, а повтор проходит', async () => {
    window.history.replaceState(
      null,
      '',
      '/courses/1/labs/102?mock=upload-error',
    );
    const progress: number[] = [];

    const error = await submit(1, 102, (percent) => {
      progress.push(percent);
    });

    expect(error).toBeInstanceOf(SubmitError);
    expect((error as ApiRequestError).message).toBe(
      'Загрузка файла прервалась',
    );
    expect(progress).toEqual([20, 40]);
    // оборванная загрузка ничего не меняет в моках
    const result = (await submit(1, 102)) as LabSubmission;
    expect(result.attempts.map((attempt) => attempt.number)).toEqual([1, 2, 3]);
  });
});
