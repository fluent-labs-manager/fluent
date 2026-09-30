// работа, которую студент выполняет сейчас
export interface ActiveLab {
  id: number;
  number: number;
  title: string;
  // дата в формате ISO 8601
  deadline: string;
  // на MVP вариант выдан у каждой активной работы
  variant: number;
}
