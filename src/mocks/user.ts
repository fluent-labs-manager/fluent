import type { User } from '@/api/users/User.dto.ts';

//данные для заглушки из src/api/users/UsersApi.ts
export const currentUser: User = {
  id: 1,
  name: 'Горелова Ульяна',
  group: 'P3322',
  role: 'student',
};

// показывается по адресу с ?role=teacher (см. src/mocks/mockMode.ts)
export const teacherUser: User = {
  id: 2,
  name: 'Михайлюк Степан',
  group: null,
  role: 'teacher',
};
