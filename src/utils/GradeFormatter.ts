const gradeFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGrade(grade: number): string {
  return gradeFormatter.format(grade);
}

// оценка за работу: без лишних нулей
const labGradeFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
});

export function formatLabGrade(grade: number): string {
  return labGradeFormatter.format(grade);
}
