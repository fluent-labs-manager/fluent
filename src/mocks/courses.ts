import type { Semester } from '@/types/course.ts';

// данные для заглушек из src/api/
export const semesters: Semester[] = [
  {
    id: 's-2026-autumn',
    title: 'Осень 2026',
    isCurrent: true,
    averageGrade: 4.82,
    courses: [
      {
        id: 'web-application-development',
        title: 'Разработка веб-приложений',
        teacher: 'Михайлюк Степан',
        completedLabs: 4,
        totalLabs: 6,
      },
      {
        id: 'neuroinformatics',
        title: 'Нейроинформатика',
        teacher: 'Орлов Андрей',
        completedLabs: 2,
        totalLabs: 8,
      },
      {
        id: 'operational-systems',
        title: 'Операционные системы',
        teacher: 'Иванова Мария',
        completedLabs: 5,
        totalLabs: 5,
      },
    ],
  },
  {
    id: 's-2026-spring',
    title: 'Весна 2026',
    isCurrent: false,
    averageGrade: 4.6,
    courses: [
      {
        id: 'databases',
        title: 'Базы данных',
        teacher: 'Николаев Игорь',
        completedLabs: 6,
        totalLabs: 6,
      },
      {
        id: 'computer-networks',
        title: 'Компьютерные сети',
        teacher: 'Смирнова Ольга',
        completedLabs: 4,
        totalLabs: 4,
      },
    ],
  },
];
