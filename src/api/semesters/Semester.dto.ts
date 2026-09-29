import type { Course } from '@/api/courses/Course.dto.ts';

export interface Semester {
  id: number;
  title: string;
  isCurrent: boolean;
  averageGrade: number;
  courses: Course[];
}
