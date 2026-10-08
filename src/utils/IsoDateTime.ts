import type { IsoDateTime } from '@/types/IsoDateTime.ts';

// 2026-10-15T23:59, секунды и доли секунды необязательны, часовой пояс — Z или ±чч:мм
const ISO_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):(\d{2}))$/;

// new Date() молча переносит 30 февраля на 2 марта, поэтому части сверяются отдельно
function hasValidParts(match: RegExpExecArray): boolean {
  const part = (index: number): number => Number(match[index] ?? 0);
  const [year, month, day] = [part(1), part(2), part(3)];
  const [hours, minutes, seconds] = [part(4), part(5), part(6)];
  const date = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds),
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hours &&
    date.getUTCMinutes() === minutes &&
    date.getUTCSeconds() === seconds &&
    part(7) <= 23 &&
    part(8) <= 59
  );
}

export function toIsoDateTime(value: string): IsoDateTime {
  const match = ISO_DATE_TIME.exec(value);

  if (match === null || !hasValidParts(match)) {
    throw new Error(
      `Некорректная дата «${value}»: ожидаются дата, время и часовой пояс в формате ISO 8601`,
    );
  }

  return value as IsoDateTime;
}
