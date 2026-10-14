import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import type { UserRole } from '@/types/UserRole.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

// проверяем режимы заглушки, через которые видны состояния страницы
describe('getAccountProfileStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function request(role: UserRole, search = ''): Promise<unknown> {
    window.history.replaceState(null, '', `/account${search}`);
    const settled = getAccountProfileStub(role).then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('для студента возвращает профиль студента', async () => {
    expect(await request('student')).toMatchObject({ role: 'student' });
  });

  it('для преподавателя возвращает профиль преподавателя', async () => {
    expect(await request('teacher')).toMatchObject({ role: 'teacher' });
  });

  it('с ?mock=error бросает ApiRequestError, как ApiResolver', async () => {
    expect(await request('student', '?mock=error')).toBeInstanceOf(
      ApiRequestError,
    );
  });
});
