import { studentProfile, teacherProfile } from '@/mocks/account.ts';
import { getMockMode, getMockRole, mockDelay } from '@/mocks/mockMode.ts';
import type { AccountProfile } from '@/api/account/AccountProfile.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * временная заглушка: данные личного кабинета текущего пользователя
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 * предлагаемый путь — GET /me/profile, согласовать с бэком
 */
// роль бэкенд возьмёт из токена, поэтому параметра нет
export async function getAccountProfileStub(): Promise<AccountProfile> {
  await mockDelay();

  if (getMockMode() === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  return structuredClone(
    getMockRole() === 'teacher' ? teacherProfile : studentProfile,
  );
}
