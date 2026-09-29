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
