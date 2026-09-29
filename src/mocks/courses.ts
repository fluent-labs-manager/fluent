import type { Semester } from '@/types/course.ts';
//TODO: заменить на запрос к бэкенду
export const currentSemester: Semester = {
  id: 's-2026-autumn',
  title: 'Осень 2026',
  averageGrade: 4.82,
  courses: [
    {
      id: 'web-application-development',
      title: 'Разработка веб-приложений',
      teacher: 'Михайлюк Степан',
      completedLabs: 4,
      totalLabs: 6,
      nearestDeadline: '2026-10-22',
      isGradeSheetClosed: false,
    },
    {
      id: 'neuroinformatics',
      title: 'Нейроинформатика',
      teacher: 'Орлов Андрей',
      completedLabs: 2,
      totalLabs: 8,
      nearestDeadline: '2026-10-20',
      isGradeSheetClosed: false,
    },
    {
      id: 'operational-systems',
      title: 'Операционные системы',
      teacher: 'Иванова Мария',
      completedLabs: 5,
      totalLabs: 5,
      nearestDeadline: null,
      isGradeSheetClosed: false,
    },
  ],
};

export const pastSemesters: Semester[] = [
  {
    id: 's-2026-spring',
    title: 'Весна 2026',
    averageGrade: 4.6,
    courses: [
      {
        id: 'databases',
        title: 'Базы данных',
        teacher: 'Николаев Игорь',
        completedLabs: 6,
        totalLabs: 6,
        nearestDeadline: null,
        isGradeSheetClosed: true,
      },
      {
        id: 'computer-networks',
        title: 'Компьютерные сети',
        teacher: 'Смирнова Ольга',
        completedLabs: 4,
        totalLabs: 4,
        nearestDeadline: null,
        isGradeSheetClosed: true,
      },
    ],
  },
];
