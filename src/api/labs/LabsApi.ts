import { semesters } from '@/mocks/courses.ts';
import { labAttempts } from '@/mocks/labAttempts.ts';
import { courseLabs } from '@/mocks/labs.ts';
import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

/**
 * временная заглушка: лабораторные работы дисциплины
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function getCourseLabsStub(courseId: number): Promise<CourseLabs> {
  await mockDelay();

  const mode = getMockMode();

  if (mode === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  const course = semesters
    .flatMap((semester) => semester.courses)
    .find((item) => item.id === courseId);

  if (course === undefined) {
    throw new ApiRequestError(404, 'Дисциплина не найдена');
  }

  const labs = mode === 'empty' ? [] : (courseLabs[courseId] ?? []);

  return structuredClone({ course, labs });
}

/**
 * временная заглушка: работа дисциплины со всеми попытками сдачи
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function getLabSubmissionStub(
  courseId: number,
  labId: number,
): Promise<LabSubmission> {
  await mockDelay();

  if (getMockMode() === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  const course = semesters
    .flatMap((semester) => semester.courses)
    .find((item) => item.id === courseId);

  if (course === undefined) {
    throw new ApiRequestError(404, 'Дисциплина не найдена');
  }

  const lab = (courseLabs[courseId] ?? []).find((item) => item.id === labId);

  if (lab === undefined) {
    throw new ApiRequestError(404, 'Работа не найдена');
  }

  return structuredClone({ course, lab, attempts: labAttempts[labId] ?? [] });
}
