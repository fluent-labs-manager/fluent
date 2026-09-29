import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user.ts';
import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { studentFixture } from '../fixtures.ts';

vi.mock('@/api/users/UsersApi.ts', () => ({ getCurrentUserStub: vi.fn() }));

const mockedGetCurrentUser = vi.mocked(getCurrentUserStub);

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it('загружает пользователя', async () => {
    mockedGetCurrentUser.mockResolvedValue(studentFixture);
    const store = useUserStore();

    await store.loadUser();

    expect(store.user).toEqual(studentFixture);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('не отправляет повторный запрос при нескольких вызовах', async () => {
    mockedGetCurrentUser.mockResolvedValue(studentFixture);
    const store = useUserStore();

    await Promise.all([store.loadUser(), store.loadUser()]);
    await store.loadUser();

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('для ошибки не из ApiResolver сохраняет общее сообщение', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('boom'));
    const store = useUserStore();

    await store.loadUser();

    expect(store.error).toBe('Не удалось загрузить пользователя');
  });

  it('сохраняет текст ошибки и разрешает повторную загрузку', async () => {
    mockedGetCurrentUser.mockRejectedValueOnce(
      new ApiRequestError(500, 'Ошибка сервера'),
    );
    const store = useUserStore();

    await store.loadUser();
    expect(store.user).toBeNull();
    expect(store.error).toBe('Ошибка сервера');

    mockedGetCurrentUser.mockResolvedValue(studentFixture);
    await store.loadUser();
    expect(store.user).toEqual(studentFixture);
    expect(store.error).toBeNull();
  });
});
