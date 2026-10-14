export interface TaughtCourse {
  id: number;
  title: string;
  // названия групп; согласовать с бэком: строки или объекты с id
  groups: string[];
  pendingReviews: number;
}
