import { describe, expect, it } from 'vitest';
import { formatGrade } from '@/utils/GradeFormatter.ts';

describe('formatGrade', () => {
  it('выводит два знака после запятой через запятую', () => {
    expect(formatGrade(4.82)).toBe('4,82');
    expect(formatGrade(4.6)).toBe('4,60');
  });
});
