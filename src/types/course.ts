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
  /** ISO-дата ближайшего дедлайна, null — если дедлайнов не осталось */
  nearestDeadline: string | null;
  /** Преподаватель закрыл ведомость — курс завершён */
  isGradeSheetClosed: boolean;
}
export interface Semester {
  id: string;
  title: string;
  averageGrade: number;
  courses: Course[];
}
