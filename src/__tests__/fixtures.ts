import type { Semester, User } from '@/types/course.ts';

// сестовые данные. не зависят от src/mocks/
export const studentFixture: User = {
  id: 'u-test',
  name: 'Тестовый Студент',
  group: 'P0000',
  role: 'student',
};

export const semestersFixture: Semester[] = [
  {
    id: 'current',
    title: 'Осень 2026',
    isCurrent: true,
    averageGrade: 4.5,
    courses: [
      {
        id: 'course-a',
        title: 'Курс А',
        teacher: 'Преподаватель А',
        completedLabs: 1,
        totalLabs: 3,
      },
      {
        id: 'course-b',
        title: 'Курс Б',
        teacher: 'Преподаватель Б',
        completedLabs: 2,
        totalLabs: 2,
      },
    ],
  },
  {
    id: 'past',
    title: 'Весна 2026',
    isCurrent: false,
    averageGrade: 4,
    courses: [
      {
        id: 'course-c',
        title: 'Курс В',
        teacher: 'Преподаватель В',
        completedLabs: 4,
        totalLabs: 4,
      },
    ],
  },
];
