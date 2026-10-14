import type { Semester } from '@/api/semesters/Semester.dto.ts';

// данные для заглушек из src/api/
export const semesters: Semester[] = [
  {
    id: 1,
    title: 'Осень 2026',
    isCurrent: true,
    averageGrade: 4.82,
    courses: [
      {
        id: 1,
        title: 'Разработка веб-приложений',
        teacher: 'Михайлюк Степан',
        completedLabs: 4,
        totalLabs: 6,
      },
      {
        id: 2,
        title: 'Нейроинформатика',
        teacher: 'Орлов Андрей',
        completedLabs: 2,
        totalLabs: 8,
      },
      {
        id: 3,
        title: 'Операционные системы',
        teacher: 'Иванова Мария',
        completedLabs: 5,
        totalLabs: 5,
      },
      {
        id: 4,
        title: 'Базы данных',
        teacher: 'Николаев Игорь',
        completedLabs: 3,
        totalLabs: 6,
      },
    ],
  },
  {
    id: 2,
    title: 'Весна 2026',
    isCurrent: false,
    averageGrade: 4.6,
    courses: [
      {
        id: 5,
        title: 'Компьютерные сети',
        teacher: 'Смирнова Ольга',
        completedLabs: 4,
        totalLabs: 4,
      },
    ],
  },
];
