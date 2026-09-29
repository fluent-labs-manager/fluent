import type { UserRole } from '@/types/UserRole.ts';

export interface User {
  id: number;
  name: string;
  group: string;
  role: UserRole;
}
