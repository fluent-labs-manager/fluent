import type { BarsSection } from '@/types/BarsSection.ts';

// работа курса — колонка будущей ведомости
export interface GradebookWork {
  id: number;
  title: string;
  // сколько баллов можно получить за работу
  maxScore: number;
  // раздел БАРС; null — работа ещё не разложена
  section: BarsSection | null;
}
