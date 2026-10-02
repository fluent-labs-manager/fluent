import type { Semester } from '@/api/semesters/Semester.dto.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import type { User } from '@/api/users/User.dto.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

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

export const courseLabsFixture: CourseLabs = {
  course: {
    id: 11,
    title: 'Курс А',
    teacher: 'Преподаватель А',
    completedLabs: 1,
    totalLabs: 3,
  },
  activeLab: {
    id: 2,
    number: 2,
    title: 'Работа Б полностью',
    deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
    variant: 42,
  },
  labs: [
    {
      id: 1,
      number: 1,
      title: 'Работа А',
      status: 'submitted',
      deadline: toIsoDateTime('2026-10-05T23:59:00+03:00'),
      grade: 4.2,
      submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
    },
    {
      id: 2,
      number: 2,
      title: 'Работа Б',
      status: 'not-submitted',
      deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
      grade: null,
      submittedAt: null,
    },
    {
      id: 3,
      number: 3,
      title: 'Работа В',
      status: 'locked',
      deadline: toIsoDateTime('2026-10-29T23:59:00+03:00'),
      grade: null,
      submittedAt: null,
    },
  ],
};
