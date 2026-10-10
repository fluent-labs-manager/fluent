const gradeFormatters = new Map<number, Intl.NumberFormat>();

// precision — сколько знаков после запятой: formatGrade(5) → «5,00», formatGrade(5, 1) → «5,0»
export function formatGrade(grade: number, precision = 2): string {
  let formatter = gradeFormatters.get(precision);

  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    gradeFormatters.set(precision, formatter);
  }

  return formatter.format(grade);
}
