// оценена, сдана и ждёт оценки, ещё не сдана, недоступна до сдачи предыдущей
export type LabStatus =
  'submitted' | 'pending-review' | 'not-submitted' | 'locked';
