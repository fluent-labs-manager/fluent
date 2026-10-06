import type { Course } from '@/api/courses/Course.dto.ts';
import type { Lab } from '@/api/labs/Lab.dto.ts';

export interface CourseLabs {
  course: Course;
  labs: Lab[];
}
