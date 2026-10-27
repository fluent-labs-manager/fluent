import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import type { SectionLimit } from '@/api/gradebook/SectionLimit.dto.ts';
import type { StudentGroup } from '@/api/gradebook/StudentGroup.dto.ts';

// всё, из чего собирается ведомость дисциплины
export interface CourseGradebook {
  courseId: number;
  courseTitle: string;
  groups: StudentGroup[];
  // лимиты своих у каждой дисциплины, по одному на каждый раздел
  sectionLimits: SectionLimit[];
  works: GradebookWork[];
}
