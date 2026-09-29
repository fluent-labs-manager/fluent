const gradeFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGrade(grade: number): string {
  return gradeFormatter.format(grade);
}
