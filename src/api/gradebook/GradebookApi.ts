import { courseGradebooks } from '@/mocks/gradebook.ts';
import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * временная заглушка: группы, лимиты разделов БАРС и работы дисциплины
 * преподавателя для конструктора баллов
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function getCourseGradebookStub(
  courseId: number,
): Promise<CourseGradebook> {
  await mockDelay();

  const mode = getMockMode();

  if (mode === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  const gradebook = courseGradebooks[courseId];

  if (gradebook === undefined) {
    throw new ApiRequestError(404, 'Дисциплина не найдена');
  }

  // в режиме empty у дисциплины ещё нет работ
  return structuredClone(
    mode === 'empty' ? { ...gradebook, works: [] } : gradebook,
  );
}
