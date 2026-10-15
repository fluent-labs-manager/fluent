import type { UserRole } from '@/types/UserRole.ts';

// помощники для заглушек API. Удалить вместе с заглушками из src/api/.
export type MockMode = 'data' | 'empty' | 'error';
export const MOCK_DELAY_MS = 700;

export function getMockMode(): MockMode {
  const mode = new URLSearchParams(window.location.search).get('mock');
  return mode === 'empty' || mode === 'error' ? mode : 'data';
}

export function mockDelay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const MOCK_ROLE_KEY = 'mock-role';

// роль текущего пользователя в заглушке: ?role=teacher или ?role=student.
// запоминается до конца сессии, как будто роль пришла в токене: ссылки внутри
// приложения теряют параметр, а данные должны оставаться одного пользователя
export function getMockRole(): UserRole {
  const param = new URLSearchParams(window.location.search).get('role');
  try {
    if (param === 'teacher' || param === 'student') {
      sessionStorage.setItem(MOCK_ROLE_KEY, param);
      return param;
    }
    return sessionStorage.getItem(MOCK_ROLE_KEY) === 'teacher'
      ? 'teacher'
      : 'student';
  } catch {
    // хранилище недоступно (например, приватный режим) — роль только из адреса
    return param === 'teacher' ? 'teacher' : 'student';
  }
}
