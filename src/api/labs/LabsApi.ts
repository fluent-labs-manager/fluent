import { semesters } from '@/mocks/courses.ts';
import { labAttempts } from '@/mocks/labAttempts.ts';
import { courseLabs } from '@/mocks/labs.ts';
import { getMockMode, MOCK_DELAY_MS, mockDelay } from '@/mocks/mockMode.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import type { Lab } from '@/api/labs/Lab.dto.ts';
import type { LabAttempt } from '@/api/labs/LabAttempt.dto.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

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

// на сколько шагов делится имитация загрузки файла
const UPLOAD_STEPS = 5;

// в режиме upload-error обрывается только первая загрузка: так виден повтор
let hasUploadFailed = false;

/**
 * временная заглушка: отправка работы на проверку. Имитирует загрузку файла
 * и сообщает её ход в onProgress (от 0 до 100). Попытка и новый статус
 * сохраняются в моках, поэтому до перезагрузки вкладки их видно на всех страницах
 * TODO: заменить на запрос через ApiResolver, когда появится контракт API
 */
export async function submitLabAttemptStub(
  courseId: number,
  labId: number,
  file: File,
  comment: string | null,
  onProgress: (percent: number) => void = () => undefined,
): Promise<LabSubmission> {
  if (getMockMode() === 'error') {
    await mockDelay();
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  const course = semesters
    .flatMap((semester) => semester.courses)
    .find((item) => item.id === courseId);
  const labs = courseLabs[courseId] ?? [];
  const labIndex = labs.findIndex((item) => item.id === labId);
  const lab = labs[labIndex];

  if (course === undefined || lab === undefined) {
    await mockDelay();
    throw new ApiRequestError(404, 'Работа не найдена');
  }

  // отправить можно только несданную работу, в том числе возвращённую
  if (lab.status !== LabStatus.NotSubmitted) {
    await mockDelay();
    throw new ApiRequestError(409, 'Работу сейчас нельзя отправить');
  }

  const failsAtStep =
    getMockMode() === 'upload-error' && !hasUploadFailed ? 3 : null;

  for (let step = 1; step <= UPLOAD_STEPS; step += 1) {
    await mockDelay(MOCK_DELAY_MS / UPLOAD_STEPS);
    if (step === failsAtStep) {
      hasUploadFailed = true;
      throw new ApiRequestError(500, 'Загрузка файла прервалась');
    }
    onProgress((step * 100) / UPLOAD_STEPS);
  }

  const submittedAt = toIsoDateTime(new Date().toISOString());
  const attempts = labAttempts[labId] ?? [];
  const lastId = Object.values(labAttempts)
    .flatMap((items) => items ?? [])
    .reduce((max, item) => Math.max(max, item.id), 0);
  const attempt: LabAttempt = {
    id: lastId + 1,
    number: attempts.length + 1,
    submittedAt,
    file: { name: file.name, size: file.size },
    comment,
    teacherComment: null,
    result: AttemptResult.Pending,
  };
  const submittedLab: Lab = {
    id: lab.id,
    number: lab.number,
    title: lab.title,
    deadline: lab.deadline,
    variant: lab.variant,
    status: LabStatus.PendingReview,
    submittedAt,
  };

  labAttempts[labId] = [...attempts, attempt];
  labs[labIndex] = submittedLab;

  return structuredClone({
    course,
    lab: submittedLab,
    attempts: labAttempts[labId],
  });
}
