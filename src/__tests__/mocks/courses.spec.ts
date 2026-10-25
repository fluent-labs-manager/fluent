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

  it('у дисциплины без лабораторных — 0 из 0', () => {
    const course = courses.find((item) => courseLabs[item.id] === undefined);

    expect(course).toMatchObject({ completedLabs: 0, totalLabs: 0 });
  });

  it('средний балл семестра считается по оценкам его работ', () => {
    const current = semesters.find((semester) => semester.isCurrent);
    const grades = (current?.courses ?? [])
      .flatMap((course) => courseLabs[course.id] ?? [])
      .flatMap((lab) =>
        lab.status === LabStatus.Submitted ? [lab.grade] : [],
      );

    expect(grades.length).toBeGreaterThan(0);
    expect(current?.averageGrade).toBeCloseTo(
      grades.reduce((sum, grade) => sum + grade, 0) / grades.length,
    );
  });

  it('без оценок средний балл семестра — null', () => {
    const withoutLabs = semesters.find((semester) =>
      semester.courses.every((course) => courseLabs[course.id] === undefined),
    );

    expect(withoutLabs?.averageGrade).toBeNull();
  });
});
