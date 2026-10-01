import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDayMonth } from '@/utils/DateFormatter.ts';

describe('DateFormatter', () => {
  it('выводит день и месяц словом', () => {
    expect(formatDayMonth('2026-10-12T18:30:00+03:00')).toBe('12 октября');
  });

  it('выводит дату и время по Москве', () => {
    expect(formatDateTime('2026-10-15T20:59:00Z')).toBe('15 октября, 23:59');
  });
});
