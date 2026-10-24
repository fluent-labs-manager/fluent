import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import type { LabStatus } from '@/types/LabStatus.ts';

interface LabBase {
  id: number;
  number: number;
  title: string;
  deadline: IsoDateTime;
}

// на MVP вариант выдан у каждой работы, кроме недоступной
interface IssuedLabBase extends LabBase {
  variant: number;
}

// работа выполнена, только когда получена оценка
interface GradedLab extends IssuedLabBase {
  status: typeof LabStatus.Submitted;
  grade: number;
  submittedAt: IsoDateTime;
}

interface PendingReviewLab extends IssuedLabBase {
  status: typeof LabStatus.PendingReview;
  submittedAt: IsoDateTime;
}

interface NotSubmittedLab extends IssuedLabBase {
  status: typeof LabStatus.NotSubmitted;
}

interface LockedLab extends LabBase {
  status: typeof LabStatus.Locked;
}

// оценка, дата сдачи и вариант есть только у тех статусов, где они имеют смысл
export type Lab = GradedLab | PendingReviewLab | NotSubmittedLab | LockedLab;

// работа, которую можно открыть в карточке: все, кроме недоступных
export type SelectableLab = Exclude<Lab, LockedLab>;
