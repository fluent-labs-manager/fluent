import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatDayMonth,
  formatNumericDate,
} from '@/utils/DateFormatter.ts';
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

  it('выводит дату числами с нулями', () => {
    expect(formatNumericDate(toIsoDateTime('2026-09-08T20:10:00+03:00'))).toBe(
      '08.09.2026',
    );
  });

  it('числовую дату тоже считает по Москве', () => {
    expect(formatNumericDate(toIsoDateTime('2026-10-17T22:30:00Z'))).toBe(
      '18.10.2026',
    );
  });
});
