import type { IsoDateTime } from '@/types/IsoDateTime.ts';

// работа, которую студент выполняет сейчас
export interface ActiveLab {
  id: number;
  number: number;
  title: string;
  deadline: IsoDateTime;
  // на MVP вариант выдан у каждой активной работы
  variant: number;
}
