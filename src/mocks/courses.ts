import type { Course } from '@/api/courses/Course.dto.ts';
import type { Semester } from '@/api/semesters/Semester.dto.ts';
import { courseLabs } from '@/mocks/labs.ts';
import { LabStatus } from '@/types/LabStatus.ts';

// число работ берём из лабораторных самой дисциплины, чтобы списки и страница
// дисциплины не расходились. Выполнена — только оценённая работа, как на её странице
function withLabCounts(
  course: Omit<Course, 'completedLabs' | 'totalLabs'>,
): Course {
  const labs = courseLabs[course.id] ?? [];
  return {
    ...course,
    completedLabs: labs.filter((lab) => lab.status === LabStatus.Submitted)
      .length,
    totalLabs: labs.length,
  };
}

// данные для заглушек из src/api/
export const semesters: Semester[] = [
  {
    id: 1,
    title: 'Осень 2026',
    isCurrent: true,
    averageGrade: 4.82,
    courses: [
      withLabCounts({
        id: 1,
        title: 'Разработка веб-приложений',
        teacher: 'Михайлюк Степан',
      }),
      withLabCounts({
        id: 2,
        title: 'Нейроинформатика',
        teacher: 'Орлов Андрей',
      }),
      withLabCounts({
        id: 3,
        title: 'Операционные системы',
        teacher: 'Иванова Мария',
      }),
      withLabCounts({
        id: 4,
        title: 'Базы данных',
        teacher: 'Николаев Игорь',
      }),
    ],
  },
  {
    id: 2,
    title: 'Весна 2026',
    isCurrent: false,
    averageGrade: 4.6,
    courses: [
      withLabCounts({
        id: 5,
        title: 'Компьютерные сети',
        teacher: 'Смирнова Ольга',
      }),
    ],
  },
];
