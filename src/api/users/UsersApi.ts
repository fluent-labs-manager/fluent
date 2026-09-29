import { currentUser } from '@/mocks/user.ts';
import { mockDelay } from '@/mocks/mockMode.ts';
import type { User } from '@/api/users/User.dto.ts';

/**
 * временная заглушка: текущий пользователь
 * TODO: заменить на запрос через ApiResolver после подключения авторизации через ITMO ID
 */
export async function getCurrentUserStub(): Promise<User> {
  await mockDelay();

  return structuredClone(currentUser);
}
