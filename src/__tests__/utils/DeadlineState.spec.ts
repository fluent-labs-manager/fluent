import { describe, expect, it } from 'vitest';
import { getDeadlineState } from '@/utils/DeadlineState.ts';

const deadline = '2026-10-15T23:59:00+03:00';

describe('getDeadlineState', () => {
  it('за три и более суток до срока возвращает normal', () => {
    expect(
      getDeadlineState(deadline, new Date('2026-10-02T12:00:00+03:00')),
    ).toBe('normal');
    expect(
      getDeadlineState(deadline, new Date('2026-10-12T23:59:00+03:00')),
    ).toBe('normal');
  });

  it('меньше чем за трое суток до срока возвращает soon', () => {
    expect(
      getDeadlineState(deadline, new Date('2026-10-13T00:00:00+03:00')),
    ).toBe('soon');
    expect(
      getDeadlineState(deadline, new Date('2026-10-15T23:59:00+03:00')),
    ).toBe('soon');
  });

  it('после срока возвращает overdue', () => {
    expect(
      getDeadlineState(deadline, new Date('2026-10-15T23:59:01+03:00')),
    ).toBe('overdue');
    expect(
      getDeadlineState(deadline, new Date('2026-11-01T12:00:00+03:00')),
    ).toBe('overdue');
  });

  it('учитывает часовой пояс срока', () => {
    // 20:59 по UTC — это 23:59 по Москве
    expect(
      getDeadlineState(
        '2026-10-15T20:59:00Z',
        new Date('2026-10-15T23:59:01+03:00'),
      ),
    ).toBe('overdue');
  });

  it('по умолчанию сравнивает с текущим временем', () => {
    expect(getDeadlineState('2000-01-01T00:00:00Z')).toBe('overdue');
    expect(getDeadlineState('2999-01-01T00:00:00Z')).toBe('normal');
  });
});
