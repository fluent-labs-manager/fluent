import type { IsoDateTime } from '@/types/IsoDateTime.ts';

interface LabBase {
  id: number;
  number: number;
  title: string;
  deadline: IsoDateTime;
}

// работа выполнена, только когда получена оценка
interface GradedLab extends LabBase {
  status: 'submitted';
  grade: number;
  submittedAt: IsoDateTime;
}

interface PendingReviewLab extends LabBase {
  status: 'pending-review';
  submittedAt: IsoDateTime;
}

interface UnsubmittedLab extends LabBase {
  status: 'not-submitted' | 'locked';
}

// оценка и дата сдачи есть только у тех статусов, где они имеют смысл
export type Lab = GradedLab | PendingReviewLab | UnsubmittedLab;
