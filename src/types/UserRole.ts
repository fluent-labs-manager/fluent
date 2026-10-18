// enum с бэка
export const UserRole = {
  Student: 'STUDENT',
  Teacher: 'TEACHER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
