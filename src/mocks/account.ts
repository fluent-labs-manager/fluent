import type {
  StudentProfile,
  TeacherProfile,
} from '@/api/account/AccountProfile.dto.ts';

// данные для заглушки из src/api/account/AccountApi.ts
// TODO: придут с бэкенда вместе с профилем пользователя (ITMO ID)
export const studentProfile: StudentProfile = {
  role: 'student',
  email: 'u.gorelova@niuitmo.ru',
  direction: 'Программная инженерия',
  courseYear: 3,
  stream: '2024/25',
};

export const teacherProfile: TeacherProfile = {
  role: 'teacher',
  email: 's.mikhailyuk@niuitmo.ru',
  department: 'Кафедра информационных систем',
  position: 'Старший преподаватель',
  courses: [
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
  ],
};
