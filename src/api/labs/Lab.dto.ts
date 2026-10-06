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

// работа, которую можно выполнять сейчас: такие показывает блок активных работ
export interface NotSubmittedLab extends LabBase {
  status: typeof LabStatus.NotSubmitted;
  // на MVP вариант выдан у каждой доступной работы
  variant: number;
}

interface LockedLab extends LabBase {
  status: typeof LabStatus.Locked;
}

// оценка, дата сдачи и вариант есть только у тех статусов, где они имеют смысл
export type Lab = GradedLab | PendingReviewLab | NotSubmittedLab | LockedLab;
