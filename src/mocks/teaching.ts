import type { TaughtCourse } from '@/api/teaching/TaughtCourse.dto.ts';

// данные для заглушки из src/api/teaching/TeachingApi.ts
export const taughtCourses: TaughtCourse[] = [
  {
    id: 1,
    title: 'Разработка веб-приложений',
    groups: ['P3322', 'P3323'],
    pendingReviews: 7,
  },
  {
    id: 6,
    title: 'Проектирование интерфейсов',
    groups: ['P3312'],
    pendingReviews: 2,
  },
  {
    id: 7,
    title: 'Технологии программирования',
    groups: ['P3210', 'P3211', 'P3212'],
    pendingReviews: 0,
  },
];
