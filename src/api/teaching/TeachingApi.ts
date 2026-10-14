import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import { taughtCourses } from '@/mocks/teaching.ts';
import type { TaughtCourse } from '@/api/teaching/TaughtCourse.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * временная заглушка: дисциплины, которые ведёт текущий преподаватель
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 * предлагаемый путь — GET /teacher/courses, согласовать с бэком
 */
export async function getTaughtCoursesStub(): Promise<TaughtCourse[]> {
  await mockDelay();

  const mode = getMockMode();

  if (mode === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  if (mode === 'empty') {
    return [];
  }

  return structuredClone(taughtCourses);
}
