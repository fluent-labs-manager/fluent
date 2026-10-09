// дисциплина, которую ведёт преподаватель
export interface TaughtCourse {
  id: number;
  title: string;
  groups: string[];
  // сданные работы, которые ещё не оценены
  pendingReviews: number;
}

export interface StudentProfile {
  role: 'student';
  email: string;
  // направление подготовки
  direction: string;
  courseYear: number;
  // учебный поток, например «2024/25»
  stream: string;
}

export interface TeacherProfile {
  role: 'teacher';
  email: string;
  department: string;
  position: string;
  courses: TaughtCourse[];
}

// данные личного кабинета, которых нет в User; набор полей зависит от роли
export type AccountProfile = StudentProfile | TeacherProfile;
