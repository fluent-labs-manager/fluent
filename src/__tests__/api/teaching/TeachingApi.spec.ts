import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTaughtCoursesStub } from '@/api/teaching/TeachingApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// проверяем режимы заглушки, через которые видны состояния страницы
describe('getTaughtCoursesStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function requestWithMode(search: string): Promise<unknown> {
    window.history.replaceState(null, '', `/account${search}`);
    const settled = getTaughtCoursesStub().then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('после задержки возвращает дисциплины преподавателя', async () => {
    const result = (await requestWithMode('')) as unknown[];

    expect(result.length).toBeGreaterThan(0);
  });

  it('с ?mock=empty возвращает пустой список', async () => {
    expect(await requestWithMode('?mock=empty')).toEqual([]);
  });

  it('с ?mock=error бросает ApiRequestError, как ApiResolver', async () => {
    expect(await requestWithMode('?mock=error')).toBeInstanceOf(
      ApiRequestError,
    );
  });
});
