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

// средний балл семестра — по оценкам всех оценённых работ его дисциплин,
// null, пока оценок нет
function withAverageGrade(semester: Omit<Semester, 'averageGrade'>): Semester {
  const grades = semester.courses
    .flatMap((course) => courseLabs[course.id] ?? [])
    .flatMap((lab) => (lab.status === LabStatus.Submitted ? [lab.grade] : []));
  return {
    ...semester,
    averageGrade:
      grades.length === 0
        ? null
        : grades.reduce((sum, grade) => sum + grade, 0) / grades.length,
  };
}

// данные для заглушек из src/api/
export const semesters: Semester[] = [
  withAverageGrade({
    id: 1,
    title: 'Осень 2026',
    isCurrent: true,
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
  }),
  withAverageGrade({
    id: 2,
    title: 'Весна 2026',
    isCurrent: false,
    courses: [
      withLabCounts({
        id: 5,
        title: 'Компьютерные сети',
        teacher: 'Смирнова Ольга',
      }),
    ],
  }),
];
