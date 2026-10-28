import type { SubmittedFile } from '@/api/labs/SubmittedFile.dto.ts';
import type { AttemptResult } from '@/types/AttemptResult.ts';
import type { IsoDateTime } from '@/types/IsoDateTime.ts';

// одна сдача работы: к попытке приложен ровно один файл
export interface LabAttempt {
  id: number;
  number: number;
  submittedAt: IsoDateTime;
  file: SubmittedFile;
  // комментарий студента к сдаче
  comment: string | null;
  teacherComment: string | null;
  result: AttemptResult;
}
