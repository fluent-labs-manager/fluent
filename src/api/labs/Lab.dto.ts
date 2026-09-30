import type { LabStatus } from '@/types/LabStatus.ts';

export interface Lab {
  id: number;
  number: number;
  title: string;
  status: LabStatus;
  // даты в формате ISO 8601
  deadline: string;
  grade: number | null;
  submittedAt: string | null;
}
