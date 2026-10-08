import { describe, expect, it } from 'vitest';
import { formatGrade } from '@/utils/GradeFormatter.ts';

describe('formatGrade', () => {
  it('выводит два знака после запятой через запятую', () => {
    expect(formatGrade(4.82)).toBe('4,82');
    expect(formatGrade(4.6)).toBe('4,60');
  });

  it('выводит заданное число знаков после запятой', () => {
    expect(formatGrade(4.2, 1)).toBe('4,2');
    expect(formatGrade(5, 1)).toBe('5,0');
    expect(formatGrade(4.82, 1)).toBe('4,8');
    expect(formatGrade(4.86, 1)).toBe('4,9');
    expect(formatGrade(4.6, 0)).toBe('5');
  });

  it('не путает форматы с разной точностью при повторных вызовах', () => {
    expect(formatGrade(5, 1)).toBe('5,0');
    expect(formatGrade(5)).toBe('5,00');
    expect(formatGrade(5, 1)).toBe('5,0');
  });
});
