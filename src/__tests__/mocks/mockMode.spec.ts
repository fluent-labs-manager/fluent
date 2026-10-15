import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMockRole } from '@/mocks/mockMode.ts';
import { UserRole } from '@/types/UserRole.ts';

describe('getMockRole', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  function openAt(url: string): void {
    window.history.replaceState(null, '', url);
  }

  it('по умолчанию — студент', () => {
    openAt('/');

    expect(getMockRole()).toBe(UserRole.Student);
  });

  it('помнит преподавателя, когда параметр пропал из адреса', () => {
    openAt('/?role=teacher');
    getMockRole();
    openAt('/account');

    expect(getMockRole()).toBe(UserRole.Teacher);
  });

  it('?role=student переключает обратно на студента', () => {
    openAt('/?role=teacher');
    getMockRole();
    openAt('/?role=student');
    getMockRole();
    openAt('/account');

    expect(getMockRole()).toBe(UserRole.Student);
  });

  it('без доступа к хранилищу берёт роль только из адреса', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    openAt('/?role=teacher');
    expect(getMockRole()).toBe(UserRole.Teacher);
    openAt('/account');
    expect(getMockRole()).toBe(UserRole.Student);
  });
});
