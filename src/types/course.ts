export type UserRole = 'student' | 'teacher';
export interface User {
  id: string;
  name: string;
  group: string;
  role: UserRole;
}
export interface Course {
  id: string;
  title: string;
  teacher: string;
  completedLabs: number;
  totalLabs: number;
}
export interface Semester {
  id: string;
  title: string;
  /** Текущий семестр — показывается по умолчанию, по нему считается сводка */
  isCurrent: boolean;
  averageGrade: number;
  courses: Course[];
}
