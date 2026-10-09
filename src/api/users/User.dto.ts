import type { UserRole } from '@/types/UserRole.ts';

export interface User {
  id: number;
  name: string;
  // учебная группа студента; у преподавателя группы нет
  group: string | null;
  role: UserRole;
}
