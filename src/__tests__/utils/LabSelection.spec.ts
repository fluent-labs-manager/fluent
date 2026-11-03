import { describe, expect, it } from 'vitest';

import type { Lab, SelectableLab } from '@/api/labs/Lab.dto.ts';
import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';
import { getDefaultLab, isSelectableLab } from '@/utils/LabSelection.ts';

const now = new Date('2026-10-02T12:00:00+03:00');

function deadline(date: string): IsoDateTime {
  return toIsoDateTime(`${date}T23:59:00+03:00`);
}

function notSubmitted(number: number, date: string): SelectableLab {
  return {
    id: number,
    number,
    title: `Работа ${String(number)}`,
    status: LabStatus.NotSubmitted,
    deadline: deadline(date),
    variant: number,
  };
}

function submitted(number: number): SelectableLab {
  return {
    id: number,
    number,
    title: `Работа ${String(number)}`,
    status: LabStatus.Submitted,
    deadline: deadline('2026-09-01'),
    variant: number,
    grade: 5,
    submittedAt: deadline('2026-08-31'),
  };
}

describe('isSelectableLab', () => {
  it('недоступную работу выбрать нельзя, остальные — можно', () => {
    const locked: Lab = {
      id: 1,
      number: 1,
      title: 'Работа 1',
      status: LabStatus.Locked,
      deadline: deadline('2026-11-01'),
    };

    expect(isSelectableLab(locked)).toBe(false);
    expect(isSelectableLab(notSubmitted(2, '2026-10-10'))).toBe(true);
    expect(isSelectableLab(submitted(3))).toBe(true);
  });
});

describe('getDefaultLab', () => {
  it('выбирает несданную работу с ближайшим непрошедшим сроком', () => {
    const labs = [
      submitted(1),
      notSubmitted(2, '2026-10-20'),
      notSubmitted(3, '2026-10-10'),
      notSubmitted(4, '2026-09-30'),
    ];

    expect(getDefaultLab(labs, now)?.id).toBe(3);
  });

  it('при одинаковом сроке выбирает работу с меньшим номером', () => {
    const labs = [notSubmitted(5, '2026-10-10'), notSubmitted(4, '2026-10-10')];

    expect(getDefaultLab(labs, now)?.id).toBe(4);
  });

  it('если сроки всех несданных прошли, выбирает несданную, а не сданную', () => {
    const labs = [
      submitted(1),
      notSubmitted(3, '2026-09-30'),
      notSubmitted(2, '2026-09-25'),
    ];

    expect(getDefaultLab(labs, now)?.id).toBe(2);
  });

  it('без несданных работ выбирает самую раннюю по номеру', () => {
    expect(getDefaultLab([submitted(3), submitted(2)], now)?.id).toBe(2);
  });

  it('без работ возвращает null', () => {
    expect(getDefaultLab([], now)).toBeNull();
  });

  it('не меняет порядок переданного списка', () => {
    const labs = [notSubmitted(2, '2026-10-20'), notSubmitted(1, '2026-10-10')];

    getDefaultLab(labs, now);

    expect(labs.map((lab) => lab.id)).toEqual([2, 1]);
  });
});
