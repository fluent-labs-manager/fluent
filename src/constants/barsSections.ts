import { BarsSection } from '@/types/BarsSection.ts';

// разделы в том порядке, в каком они идут на странице и в ведомости
export const BARS_SECTION_ORDER: readonly BarsSection[] = [
  BarsSection.ClassWork,
  BarsSection.Labs,
  BarsSection.Tests,
  BarsSection.Midterm,
  BarsSection.Exam,
];

export const BARS_SECTION_LABELS: Record<BarsSection, string> = {
  [BarsSection.ClassWork]: 'Работа на занятиях',
  [BarsSection.Labs]: 'Лабораторные работы',
  [BarsSection.Tests]: 'Контрольные работы',
  [BarsSection.Midterm]: 'Рубежный контроль',
  [BarsSection.Exam]: 'Экзамен',
};

// порог допуска к аттестации, пока преподаватель его не поменял
export const DEFAULT_ADMISSION_THRESHOLD = 60;

// за дисциплину в БАРС — 100 баллов; доп. баллы преподаватель ставит
// в БАРС сам, в конструкторе их нет
export const MAX_ADMISSION_THRESHOLD = 100;

// тип данных при перетаскивании работы: так её отличают от файлов и текста
export const WORK_DRAG_TYPE = 'application/x-fluent-work';
