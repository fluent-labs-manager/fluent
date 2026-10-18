import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { UserRole } from '@/types/UserRole.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// проверяем режимы заглушки, через которые видны состояния страницы
describe('getAccountProfileStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
  });

  async function request(search = ''): Promise<unknown> {
    window.history.replaceState(null, '', `/account${search}`);
    const settled = getAccountProfileStub().then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('по умолчанию возвращает профиль студента', async () => {
    expect(await request()).toMatchObject({ role: UserRole.Student });
  });

  it('с ?role=teacher возвращает профиль преподавателя', async () => {
    expect(await request('?role=teacher')).toMatchObject({
      role: UserRole.Teacher,
    });
  });

  it('с ?mock=error бросает ApiRequestError, как ApiResolver', async () => {
    expect(await request('?mock=error')).toBeInstanceOf(ApiRequestError);
  });
});
