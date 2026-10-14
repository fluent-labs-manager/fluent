// дисциплина, которую ведёт преподаватель
export interface TaughtCourse {
  id: number;
  title: string;
  groups: string[];
  // сданные работы, которые ещё не оценены
  pendingReviews: number;
}
