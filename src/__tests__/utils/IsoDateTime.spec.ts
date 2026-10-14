import { describe, expect, it } from 'vitest';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

describe('toIsoDateTime', () => {
  it('принимает дату и время с часовым поясом', () => {
    expect(toIsoDateTime('2026-10-15T23:59:00+03:00')).toBe(
      '2026-10-15T23:59:00+03:00',
    );
    expect(toIsoDateTime('2026-10-15T20:59:00Z')).toBe('2026-10-15T20:59:00Z');
  });

  it('принимает время без секунд и с долями секунды', () => {
    expect(toIsoDateTime('2026-10-15T23:59+03:00')).toBe(
      '2026-10-15T23:59+03:00',
    );
    expect(toIsoDateTime('2026-10-15T23:59:00.123Z')).toBe(
      '2026-10-15T23:59:00.123Z',
    );
  });

  it('не принимает дату без времени', () => {
    expect(() => toIsoDateTime('2026-10-12')).toThrow(
      'Некорректная дата «2026-10-12»',
    );
  });

  it('не принимает время без часового пояса', () => {
    expect(() => toIsoDateTime('2026-10-12T18:30:00')).toThrow(
      'Некорректная дата',
    );
  });

  it('не принимает несуществующие дату и время', () => {
    expect(() => toIsoDateTime('2026-02-30T10:00:00Z')).toThrow(
      'Некорректная дата',
    );
    expect(() => toIsoDateTime('2026-13-01T10:00:00Z')).toThrow(
      'Некорректная дата',
    );
    expect(() => toIsoDateTime('2026-10-12T24:00:00Z')).toThrow(
      'Некорректная дата',
    );
    expect(() => toIsoDateTime('2026-10-12T18:60:00Z')).toThrow(
      'Некорректная дата',
    );
    expect(() => toIsoDateTime('2026-10-12T18:30:00+24:00')).toThrow(
      'Некорректная дата',
    );
  });

  it('учитывает високосный год', () => {
    expect(toIsoDateTime('2028-02-29T12:00:00Z')).toBe('2028-02-29T12:00:00Z');
    expect(() => toIsoDateTime('2026-02-29T12:00:00Z')).toThrow(
      'Некорректная дата',
    );
  });

  it('не принимает строку не в формате даты', () => {
    expect(() => toIsoDateTime('abc')).toThrow('Некорректная дата «abc»');
    expect(() => toIsoDateTime('')).toThrow('Некорректная дата «»');
    expect(() => toIsoDateTime(' 2026-10-15T23:59:00Z')).toThrow(
      'Некорректная дата',
    );
  });
});
