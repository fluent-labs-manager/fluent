import { semesters } from '@/mocks/courses.ts';
import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import type { Semester } from '@/api/semesters/Semester.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function getSemestersStub(): Promise<Semester[]> {
  await mockDelay();

  const mode = getMockMode();

  if (mode === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  if (mode === 'empty') {
    return [];
  }

  return structuredClone(semesters);
}
