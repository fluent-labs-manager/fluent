// результат попытки сдачи: вернули на доработку, ждёт проверки, принята
export const AttemptResult = {
  Rejected: 'rejected',
  Pending: 'pending',
  Accepted: 'accepted',
} as const;

export type AttemptResult = (typeof AttemptResult)[keyof typeof AttemptResult];
