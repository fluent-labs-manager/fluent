import { describe, expect, it } from 'vitest';

import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import {
  getNextWorkId,
  getSectionWorks,
  sumMaxScores,
} from '@/utils/ScoreBuilder.ts';

const works: GradebookWork[] = [
  { id: 3, title: 'ЛР1', maxScore: 10, section: BarsSection.Practice },
  { id: 7, title: 'ЛР2', maxScore: 15, section: BarsSection.Practice },
  { id: 5, title: 'Тест', maxScore: 5, section: null },
];

describe('ScoreBuilder', () => {
  it('складывает баллы работ', () => {
    expect(sumMaxScores(works)).toBe(30);
    expect(sumMaxScores([])).toBe(0);
  });

  it('отбирает работы раздела и неразложенные', () => {
    expect(
      getSectionWorks(works, BarsSection.Practice).map((work) => work.id),
    ).toEqual([3, 7]);
    expect(getSectionWorks(works, null).map((work) => work.id)).toEqual([5]);
    expect(getSectionWorks(works, BarsSection.Exam)).toEqual([]);
  });

  it('id новой работы — следующий после самого большого', () => {
    expect(getNextWorkId(works)).toBe(8);
    expect(getNextWorkId([])).toBe(1);
  });
});
