import type { Semester } from '@/api/semesters/Semester.dto.ts';
import type { User } from '@/api/users/User.dto.ts';

// тестовые данные. не зависят от src/mocks/
export const studentFixture: User = {
  id: 100,
  name: 'Тестовый Студент',
  group: 'P0000',
  role: 'student',
};

export const semestersFixture: Semester[] = [
  {
    id: 10,
    title: 'Осень 2026',
    isCurrent: true,
    averageGrade: 4.5,
    courses: [
      {
        id: 11,
        title: 'Курс А',
        teacher: 'Преподаватель А',
        completedLabs: 1,
        totalLabs: 3,
      },
      {
        id: 12,
        title: 'Курс Б',
        teacher: 'Преподаватель Б',
        completedLabs: 2,
        totalLabs: 2,
      },
    ],
  },
  {
    id: 20,
    title: 'Весна 2026',
    isCurrent: false,
    averageGrade: 4,
    courses: [
      {
        id: 21,
        title: 'Курс В',
        teacher: 'Преподаватель В',
        completedLabs: 4,
        totalLabs: 4,
      },
    ],
  },
];
