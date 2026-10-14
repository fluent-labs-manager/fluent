import type { UserRole } from '@/types/UserRole.ts';

export interface User {
  id: number;
  name: string;
  // учебная группа студента; у преподавателя группы нет
  // согласовать с бэком: строка или объект с id
  group: string | null;
  role: UserRole;
}
