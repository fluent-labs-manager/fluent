import type {
  StudentProfile,
  TeacherProfile,
} from '@/api/account/AccountProfile.dto.ts';
import type { TaughtCourse } from '@/api/teaching/TaughtCourse.dto.ts';
import type { Semester } from '@/api/semesters/Semester.dto.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import type { User } from '@/api/users/User.dto.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

// тестовые данные. не зависят от src/mocks/
export const studentFixture: User = {
  id: 100,
  name: 'Тестовый Студент',
  group: 'P0000',
  role: 'student',
};

export const teacherFixture: User = {
  id: 200,
  name: 'Тестовый Преподаватель',
  group: null,
  role: 'teacher',
};

export const studentProfileFixture: StudentProfile = {
  role: 'student',
  email: 'student@test.ru',
  direction: 'Тестовое направление',
  courseYear: 2,
  stream: '2025/26',
};

export const teacherProfileFixture: TeacherProfile = {
  role: 'teacher',
  email: 'teacher@test.ru',
  department: 'Тестовая кафедра',
  position: 'Доцент',
};

export const taughtCoursesFixture: TaughtCourse[] = [
  {
    id: 31,
    title: 'Дисциплина Г',
    groups: ['P1111', 'P1112'],
    pendingReviews: 4,
  },
  {
    id: 32,
    title: 'Дисциплина Д',
    groups: ['P1111'],
    pendingReviews: 0,
  },
];

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
  labs: [
    {
      id: 1,
      number: 1,
      title: 'Работа А',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-10-05T23:59:00+03:00'),
      grade: 4.2,
      submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
    },
    {
      id: 2,
      number: 2,
      title: 'Работа Б',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
      variant: 42,
    },
    {
      id: 3,
      number: 3,
      title: 'Работа В',
      status: LabStatus.Locked,
      deadline: toIsoDateTime('2026-10-29T23:59:00+03:00'),
    },
  ],
};
