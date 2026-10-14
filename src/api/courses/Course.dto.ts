export interface Course {
  id: number;
  title: string;
  // согласовать: имя строкой или объект с id
  teacher: string;
  completedLabs: number;
  totalLabs: number;
}
