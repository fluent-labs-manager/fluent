import { describe, expect, it } from 'vitest';

import { pluralize } from '@/utils/Plural.ts';

const students = ['студент', 'студента', 'студентов'] as const;

describe('pluralize', () => {
  it('подбирает форму по числу', () => {
    expect(pluralize(1, students)).toBe('1 студент');
    expect(pluralize(3, students)).toBe('3 студента');
    expect(pluralize(5, students)).toBe('5 студентов');
    expect(pluralize(0, students)).toBe('0 студентов');
  });

  it('учитывает исключения 11–14', () => {
    expect(pluralize(11, students)).toBe('11 студентов');
    expect(pluralize(12, students)).toBe('12 студентов');
    expect(pluralize(21, students)).toBe('21 студент');
    expect(pluralize(22, students)).toBe('22 студента');
  });
});
