import type { UserRole } from '@/types/UserRole.ts';

export interface User {
  id: number;
  name: string;
  // учебная группа; согласовать: строка или id
  group: string | null;
  role: UserRole;
}
