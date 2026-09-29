import { describe, it, expect } from 'vitest';

import { formatPercent, getPercent } from '@/utils/progress.ts';

describe('getPercent', () => {
  it('округляет вверх до одного знака после запятой', () => {
    expect(getPercent(4, 6)).toBe(66.7);
    expect(getPercent(11, 19)).toBe(57.9);
    expect(getPercent(1, 3)).toBe(33.4);
  });

  it('не округляет точные значения', () => {
    expect(getPercent(2, 8)).toBe(25);
    expect(getPercent(7, 100)).toBe(7);
    expect(getPercent(5, 5)).toBe(100);
  });

  it('возвращает 0 при нулевом максимуме и не превышает 100', () => {
    expect(getPercent(3, 0)).toBe(0);
    expect(getPercent(7, 5)).toBe(100);
  });
});

describe('formatPercent', () => {
  it('использует запятую и отбрасывает ноль после запятой', () => {
    expect(formatPercent(66.7)).toBe('66,7%');
    expect(formatPercent(25)).toBe('25%');
  });
});
