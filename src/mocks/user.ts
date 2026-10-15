import type { User } from '@/api/users/User.dto.ts';
import { UserRole } from '@/types/UserRole.ts';

//данные для заглушки из src/api/users/UsersApi.ts
export const currentUser: User = {
  id: 1,
  name: 'Горелова Ульяна',
  group: 'P3322',
  role: UserRole.Student,
};

// показывается по адресу с ?role=teacher (см. src/mocks/mockMode.ts)
export const teacherUser: User = {
  id: 2,
  name: 'Михайлюк Степан',
  group: null,
  role: UserRole.Teacher,
};
