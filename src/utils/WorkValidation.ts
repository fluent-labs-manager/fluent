import {
  MAX_WORK_SCORE,
  MAX_WORK_TITLE_LENGTH,
} from '@/constants/gradebookWork.ts';

// проверка названия новой работы: текст ошибки или null.
// Названия не повторяются: это заголовки колонок одной ведомости
export function validateWorkTitle(
  title: string,
  existingTitles: string[],
): string | null {
  const normalized = title.trim().toLocaleLowerCase('ru-RU');
  if (normalized === '') {
    return 'Введите название';
  }
  if (title.trim().length > MAX_WORK_TITLE_LENGTH) {
    return `Название — не длиннее ${String(MAX_WORK_TITLE_LENGTH)} символов`;
  }
  const isTaken = existingTitles.some(
    (existing) => existing.trim().toLocaleLowerCase('ru-RU') === normalized,
  );
  return isTaken ? 'Работа с таким названием уже есть' : null;
}

// проверка баллов из поля ввода: число или текст ошибки
export function parseWorkScore(
  value: string,
): { score: number; error: null } | { score: null; error: string } {
  const score = Number(value);
  const isValid =
    value.trim() !== '' &&
    Number.isInteger(score) &&
    score >= 1 &&
    score <= MAX_WORK_SCORE;
  return isValid
    ? { score, error: null }
    : {
        score: null,
        error: `Баллы — целое число от 1 до ${String(MAX_WORK_SCORE)}`,
      };
}
