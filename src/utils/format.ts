/**
 * Дата без времени ('2026-10-22') по стандарту разбирается как полночь UTC.
 * Форматируем тоже в UTC, иначе в часовых поясах западнее Гринвича
 * дата сдвигается на день назад (22 октября → 21 октября).
 */
const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

export function formatDayMonth(isoDate: string): string {
  return dayMonthFormatter.format(new Date(isoDate));
}

const gradeFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGrade(grade: number): string {
  return gradeFormatter.format(grade);
}
