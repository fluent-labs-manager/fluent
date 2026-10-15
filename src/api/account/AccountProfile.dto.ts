import type { UserRole } from '@/types/UserRole.ts';

export interface StudentProfile {
  role: typeof UserRole.Student;
  email: string;
  // направление подготовки
  direction: string;
  courseYear: number;
  // учебный поток, например «2024/25»
  stream: string;
}

export interface TeacherProfile {
  role: typeof UserRole.Teacher;
  email: string;
  // кафедра или факультет; название поля согласовать
  department: string;
  position: string;
}

// данные личного кабинета, которых нет в User; набор полей зависит от роли.
export type AccountProfile = StudentProfile | TeacherProfile;
