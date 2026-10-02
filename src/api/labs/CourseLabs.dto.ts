import type { Course } from '@/api/courses/Course.dto.ts';
import type { ActiveLab } from '@/api/labs/ActiveLab.dto.ts';
import type { Lab } from '@/api/labs/Lab.dto.ts';

export interface CourseLabs {
  course: Course;
  // null, если все работы сданы или лабораторных нет
  activeLab: ActiveLab | null;
  labs: Lab[];
}
