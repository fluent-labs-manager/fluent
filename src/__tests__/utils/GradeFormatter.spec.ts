import { describe, expect, it } from 'vitest';
import { formatGrade, formatLabGrade } from '@/utils/GradeFormatter.ts';

describe('formatGrade', () => {
  it('выводит два знака после запятой через запятую', () => {
    expect(formatGrade(4.82)).toBe('4,82');
    expect(formatGrade(4.6)).toBe('4,60');
  });
});

describe('formatLabGrade', () => {
  it('выводит не больше одного знака после запятой', () => {
    expect(formatLabGrade(4.2)).toBe('4,2');
    expect(formatLabGrade(5)).toBe('5');
  });
});
