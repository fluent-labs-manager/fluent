import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getLabSubmissionStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
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
