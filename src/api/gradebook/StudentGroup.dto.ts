import type { GroupStudent } from '@/api/gradebook/GroupStudent.dto.ts';

export interface StudentGroup {
  // название группы, как в TaughtCourse.groups
  name: string;
  students: GroupStudent[];
}
