// оценена, сдана и ждёт оценки, ещё не сдана, недоступна до сдачи предыдущей
export const LabStatus = {
  Submitted: 'submitted',
  PendingReview: 'pending-review',
  NotSubmitted: 'not-submitted',
  Locked: 'locked',
} as const;

export type LabStatus = (typeof LabStatus)[keyof typeof LabStatus];
