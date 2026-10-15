import { studentProfile, teacherProfile } from '@/mocks/account.ts';
import { getMockMode, getMockRole, mockDelay } from '@/mocks/mockMode.ts';
import type { AccountProfile } from '@/api/account/AccountProfile.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
// роль бэкенд возьмёт из токена, параметра нет
export async function getAccountProfileStub(): Promise<AccountProfile> {
  await mockDelay();

  if (getMockMode() === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  return structuredClone(
    getMockRole() === 'teacher' ? teacherProfile : studentProfile,
  );
}
