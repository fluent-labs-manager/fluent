import { LabStatus } from '@/types/LabStatus.ts';

// подписи статусов одни для бейджа в списке и строки статуса на странице работы
export const LAB_STATUS_LABELS: Record<LabStatus, string> = {
  [LabStatus.Submitted]: 'Сдано',
  [LabStatus.PendingReview]: 'На проверке',
  [LabStatus.NotSubmitted]: 'Не сдано',
  [LabStatus.Locked]: 'Недоступно',
};
