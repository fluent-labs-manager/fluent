import type { Course } from '@/api/courses/Course.dto.ts';
import type { LabAttempt } from '@/api/labs/LabAttempt.dto.ts';
import type { Lab } from '@/api/labs/Lab.dto.ts';

export interface LabSubmission {
  course: Course;
  lab: Lab;
  // попытки по возрастанию номера
  attempts: LabAttempt[];
}
