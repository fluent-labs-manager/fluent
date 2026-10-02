import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import type { LabStatus } from '@/types/LabStatus.ts';

export interface Lab {
  id: number;
  number: number;
  title: string;
  status: LabStatus;
  deadline: IsoDateTime;
  grade: number | null;
  submittedAt: IsoDateTime | null;
}
