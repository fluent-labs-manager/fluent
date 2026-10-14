import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';

describe('getCurrentUserStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
  });

  async function requestWith(search: string): Promise<unknown> {
    window.history.replaceState(null, '', `/account${search}`);
    const request = getCurrentUserStub();
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return request;
  }

  it('по умолчанию возвращает студента с группой', async () => {
    const user = (await requestWith('')) as { group: string | null };

    expect(user).toMatchObject({ role: 'student' });
    expect(user.group).not.toBeNull();
  });

  it('с ?role=teacher возвращает преподавателя без группы', async () => {
    expect(await requestWith('?role=teacher')).toMatchObject({
      role: 'teacher',
      group: null,
    });
  });
});
