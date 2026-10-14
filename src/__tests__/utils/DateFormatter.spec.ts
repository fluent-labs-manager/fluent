import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDayMonth } from '@/utils/DateFormatter.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

describe('DateFormatter', () => {
  it('выводит день и месяц словом', () => {
    expect(formatDayMonth(toIsoDateTime('2026-10-12T18:30:00+03:00'))).toBe(
      '12 октября',
    );
  });

  it('выводит московское время как есть', () => {
    expect(formatDateTime(toIsoDateTime('2026-10-15T23:59:00+03:00'))).toBe(
      '15 октября, 23:59',
    );
  });

  it('переводит время в UTC в московское', () => {
    expect(formatDateTime(toIsoDateTime('2026-10-15T20:59:00Z'))).toBe(
      '15 октября, 23:59',
    );
  });

  it('переводит время из другого часового пояса в московское', () => {
    expect(formatDateTime(toIsoDateTime('2026-10-16T01:59:00+05:00'))).toBe(
      '15 октября, 23:59',
    );
  });

  it('при переходе через полночь по Москве меняет день', () => {
    expect(formatDayMonth(toIsoDateTime('2026-10-12T22:30:00Z'))).toBe(
      '13 октября',
    );
    expect(formatDateTime(toIsoDateTime('2026-10-12T22:30:00Z'))).toBe(
      '13 октября, 01:30',
    );
  });

  it('пишет однозначный день без нуля, а часы и минуты — с нулём', () => {
    expect(formatDateTime(toIsoDateTime('2026-10-05T09:05:00+03:00'))).toBe(
      '5 октября, 09:05',
    );
  });
});
