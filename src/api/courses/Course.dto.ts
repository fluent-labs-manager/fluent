export interface Course {
  id: number;
  title: string;
  // согласовать с бэком: имя строкой или объект с id
  teacher: string;
  // только оценённые работы, без отправленных на проверку — согласовать
  completedLabs: number;
  totalLabs: number;
}
