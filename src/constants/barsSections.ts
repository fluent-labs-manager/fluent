import { BarsSection } from '@/types/BarsSection.ts';

// разделы в том порядке, в каком они идут на странице и в ведомости
export const BARS_SECTION_ORDER: readonly BarsSection[] = [
  BarsSection.ClassWork,
  BarsSection.Practice,
  BarsSection.Tests,
  BarsSection.Midterm,
  BarsSection.Exam,
  BarsSection.Bonus,
];

export const BARS_SECTION_LABELS: Record<BarsSection, string> = {
  [BarsSection.ClassWork]: 'Работа на занятиях',
  [BarsSection.Practice]: 'Практика',
  [BarsSection.Tests]: 'Контрольные работы',
  [BarsSection.Midterm]: 'Рубежный контроль',
  [BarsSection.Exam]: 'Экзамен',
  [BarsSection.Bonus]: 'Доп. баллы',
};

// порог допуска к аттестации, пока преподаватель его не поменял
export const DEFAULT_ADMISSION_THRESHOLD = 60;
