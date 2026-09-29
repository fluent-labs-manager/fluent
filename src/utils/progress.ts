/**
 * Процент выполнения с одним знаком после запятой, округлённый вверх.
 * Считаем через целые числа, чтобы избежать ошибок плавающей точки
 * (например, 7 / 100 * 100 = 7.000000000000001).
 */
export function getPercent(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.min(100, Math.ceil((value * 1000) / max) / 10);
}

const percentFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
});

export function formatPercent(percent: number): string {
  return `${percentFormatter.format(percent)}%`;
}
