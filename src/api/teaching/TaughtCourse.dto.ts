// дисциплина, которую ведёт преподаватель
export interface TaughtCourse {
  id: number;
  title: string;
  // названия групп; согласовать с бэком: строки или объекты с id
  groups: string[];
  // сданные работы, которые ещё не оценены
  pendingReviews: number;
}
