import { describe, expect, it } from 'vitest';

import { parseWorkScore, validateWorkTitle } from '@/utils/WorkValidation.ts';

describe('validateWorkTitle', () => {
  const existing = ['ЛР1', 'Экзамен'];

  it('принимает новое название', () => {
    expect(validateWorkTitle('ЛР6', existing)).toBeNull();
  });

  it('пустое название не принимает', () => {
    expect(validateWorkTitle('   ', existing)).toBe('Введите название');
  });

  it('название длиннее 60 символов не принимает', () => {
    expect(validateWorkTitle('а'.repeat(60), existing)).toBeNull();
    expect(validateWorkTitle('а'.repeat(61), existing)).toBe(
      'Название — не длиннее 60 символов',
    );
  });

  it('повтор названия не принимает без учёта регистра и пробелов', () => {
    expect(validateWorkTitle(' экзамен ', existing)).toBe(
      'Работа с таким названием уже есть',
    );
  });
});

describe('parseWorkScore', () => {
  it('принимает целое число от 1 до 100', () => {
    expect(parseWorkScore('1')).toEqual({ score: 1, error: null });
    expect(parseWorkScore('100')).toEqual({ score: 100, error: null });
  });

  it.each(['', '0', '101', '2.5', '-3', 'abc'])(
    'значение «%s» не принимает',
    (value) => {
      expect(parseWorkScore(value)).toEqual({
        score: null,
        error: 'Баллы — целое число от 1 до 100',
      });
    },
  );
});
