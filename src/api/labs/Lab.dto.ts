import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import type { LabStatus } from '@/types/LabStatus.ts';

interface LabBase {
  id: number;
  number: number;
  title: string;
  deadline: IsoDateTime;
}

// работа выполнена, только когда получена оценка
interface GradedLab extends LabBase {
  status: typeof LabStatus.Submitted;
  grade: number;
  submittedAt: IsoDateTime;
}

interface PendingReviewLab extends LabBase {
  status: typeof LabStatus.PendingReview;
  submittedAt: IsoDateTime;
}

interface UnsubmittedLab extends LabBase {
  status: typeof LabStatus.NotSubmitted | typeof LabStatus.Locked;
}

// оценка и дата сдачи есть только у тех статусов, где они имеют смысл
export type Lab = GradedLab | PendingReviewLab | UnsubmittedLab;
