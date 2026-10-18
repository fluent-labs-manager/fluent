import type {
  StudentProfile,
  TeacherProfile,
} from '@/api/account/AccountProfile.dto.ts';
import { UserRole } from '@/types/UserRole.ts';

// данные для заглушки из src/api/account/AccountApi.ts
// TODO: придут с бэкенда вместе с профилем пользователя (ITMO ID)
export const studentProfile: StudentProfile = {
  role: UserRole.Student,
  email: 'u.gorelova@niuitmo.ru',
  direction: 'Программная инженерия',
  courseYear: 3,
  stream: '2024/25',
};

export const teacherProfile: TeacherProfile = {
  role: UserRole.Teacher,
  email: 's.mikhailyuk@niuitmo.ru',
  department: 'Факультет программной инженерии и компьютерной техники',
  position: 'Старший преподаватель',
};
