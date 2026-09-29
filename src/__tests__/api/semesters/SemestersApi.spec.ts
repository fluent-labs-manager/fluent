import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// проверяем режимы заглушки через которые видны состояния страницы
describe('getSemestersStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function requestWithMode(search: string): Promise<unknown> {
    window.history.replaceState(null, '', `/courses${search}`);
    const request = getSemestersStub();
    const settled = request.then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('после задержки возвращает семестры с текущим', async () => {
    const result = (await requestWithMode('')) as { isCurrent: boolean }[];

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((semester) => semester.isCurrent)).toBe(true);
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
