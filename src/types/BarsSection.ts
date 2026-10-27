// раздел ведомости БАРС, в который попадают баллы за работу
export const BarsSection = {
  ClassWork: 'class-work',
  Practice: 'practice',
  Tests: 'tests',
  Midterm: 'midterm',
  Exam: 'exam',
  // до 3 баллов сверх 100 на усмотрение преподавателя
  Bonus: 'bonus',
} as const;

export type BarsSection = (typeof BarsSection)[keyof typeof BarsSection];
