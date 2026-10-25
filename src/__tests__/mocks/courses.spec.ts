import { describe, expect, it } from 'vitest';

import { semesters } from '@/mocks/courses.ts';
import { courseLabs } from '@/mocks/labs.ts';
import { LabStatus } from '@/types/LabStatus.ts';

// список дисциплин и страница дисциплины должны показывать одни и те же числа
describe('моки дисциплин', () => {
  const courses = semesters.flatMap((semester) => semester.courses);

  it.each(courses)(
    '«$title»: число работ совпадает с лабораторными дисциплины',
    (course) => {
      const labs = courseLabs[course.id] ?? [];

      expect(course.totalLabs).toBe(labs.length);
      expect(course.completedLabs).toBe(
        labs.filter((lab) => lab.status === LabStatus.Submitted).length,
      );
    },
  );

  it('у каждой дисциплины есть лабораторные', () => {
    expect(courses.filter((course) => course.totalLabs === 0)).toEqual([]);
  });
});
