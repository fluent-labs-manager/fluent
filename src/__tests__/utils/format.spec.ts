import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatDayMonth, formatGrade } from '@/utils/format.ts';

describe('formatDayMonth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('форматирует дату как «день месяц»', () => {
    expect(formatDayMonth('2026-10-22')).toBe('22 октября');
  });

  it('не сдвигает дату в часовых поясах западнее UTC', async () => {
    // Форматтер создаётся при загрузке модуля, поэтому меняем часовой пояс
    // до импорта и загружаем модуль заново.
    vi.stubEnv('TZ', 'America/New_York');
    vi.resetModules();
    const { formatDayMonth: formatInNewYork } =
      await import('@/utils/format.ts');

    expect(formatInNewYork('2026-10-22')).toBe('22 октября');
  });
});

describe('formatGrade', () => {
  it('выводит два знака после запятой через запятую', () => {
    expect(formatGrade(4.82)).toBe('4,82');
    expect(formatGrade(4.6)).toBe('4,60');
  });
});
