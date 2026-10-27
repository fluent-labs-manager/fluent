// раздел ведомости БАРС, в который попадают баллы за работу
export const BarsSection = {
  ClassWork: 'class-work',
  Labs: 'labs',
  Tests: 'tests',
  Midterm: 'midterm',
  Exam: 'exam',
} as const;

export type BarsSection = (typeof BarsSection)[keyof typeof BarsSection];
