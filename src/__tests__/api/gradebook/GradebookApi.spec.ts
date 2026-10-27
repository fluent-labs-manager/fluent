import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCourseGradebookStub } from '@/api/gradebook/GradebookApi.ts';
import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import { courseGradebooks } from '@/mocks/gradebook.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { taughtCourses } from '@/mocks/teaching.ts';
import { BARS_SECTION_ORDER } from '@/constants/barsSections.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

describe('getCourseGradebookStub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function request(courseId: number, search = ''): Promise<unknown> {
    window.history.replaceState(null, '', `/score-builder${search}`);
    const settled = getCourseGradebookStub(courseId).then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('возвращает ведомость дисциплины', async () => {
    const result = (await request(1)) as CourseGradebook;

    expect(result.courseTitle).toBe('Разработка веб-приложений');
    expect(result.groups.map((group) => group.name)).toEqual([
      'P3322',
      'P3323',
    ]);
    expect(result.works.length).toBeGreaterThan(0);
  });

  it('отдаёт копию: изменения не попадают в моки', async () => {
    const result = (await request(1)) as CourseGradebook;
    result.works = [];

    const again = (await request(1)) as CourseGradebook;
    expect(again.works.length).toBeGreaterThan(0);
  });

  it('для чужой дисциплины отвечает 404', async () => {
    const error = await request(999);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).message).toBe('Дисциплина не найдена');
  });

  it('с ?mock=empty у дисциплины нет работ', async () => {
    const result = (await request(1, '?mock=empty')) as CourseGradebook;

    expect(result.works).toEqual([]);
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it('с ?mock=error бросает ApiRequestError, как ApiResolver', async () => {
    expect(await request(1, '?mock=error')).toBeInstanceOf(ApiRequestError);
  });
});

// моки должны быть согласованы со списком дисциплин преподавателя
describe('моки ведомостей', () => {
  it('ведомость есть у каждой дисциплины преподавателя, группы совпадают', () => {
    for (const course of taughtCourses) {
      const gradebook = courseGradebooks[course.id];

      expect(gradebook?.courseTitle).toBe(course.title);
      expect(gradebook?.groups.map((group) => group.name)).toEqual(
        course.groups,
      );
    }
  });

  it('у каждой дисциплины лимиты всех разделов и в сумме 103', () => {
    for (const gradebook of Object.values(courseGradebooks)) {
      const limits = gradebook?.sectionLimits ?? [];

      expect(limits.map((item) => item.section)).toEqual(BARS_SECTION_ORDER);
      expect(limits.reduce((sum, item) => sum + item.limit, 0)).toBe(103);
    }
  });

  it('в группах от 5 до 8 студентов с разными номерами ИСУ', () => {
    const groups = Object.values(courseGradebooks).flatMap(
      (gradebook) => gradebook?.groups ?? [],
    );
    const isuIds = groups.flatMap((group) =>
      group.students.map((student) => student.isuId),
    );

    for (const group of groups) {
      expect(group.students.length).toBeGreaterThanOrEqual(5);
      expect(group.students.length).toBeLessThanOrEqual(8);
    }
    expect(new Set(isuIds).size).toBe(isuIds.length);
  });
});
