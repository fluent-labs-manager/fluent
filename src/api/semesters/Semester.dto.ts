import type { Course } from '@/api/courses/Course.dto.ts';

export interface Semester {
  id: number;
  title: string;
  isCurrent: boolean;
  // null — в семестре ещё нет оценок. Шкала 5-балльная — согласовать с бэком
  averageGrade: number | null;
  courses: Course[];
}
