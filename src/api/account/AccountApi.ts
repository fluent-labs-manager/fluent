import { studentProfile, teacherProfile } from '@/mocks/account.ts';
import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import type { AccountProfile } from '@/api/account/AccountProfile.dto.ts';
import type { UserRole } from '@/types/UserRole.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * временная заглушка: данные личного кабинета текущего пользователя
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function getAccountProfileStub(
  role: UserRole,
): Promise<AccountProfile> {
  await mockDelay();

  if (getMockMode() === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  return structuredClone(role === 'teacher' ? teacherProfile : studentProfile);
}
