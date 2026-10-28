import { describe, expect, it } from 'vitest';

import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import {
  getMoveTargets,
  getNextWorkId,
  getSectionWorks,
  sumMaxScores,
} from '@/utils/ScoreBuilder.ts';

const works: GradebookWork[] = [
  { id: 3, title: 'ЛР1', maxScore: 10, section: BarsSection.Labs },
  { id: 7, title: 'ЛР2', maxScore: 15, section: BarsSection.Labs },
  { id: 5, title: 'Тест', maxScore: 5, section: null },
];

describe('ScoreBuilder', () => {
  it('складывает баллы работ', () => {
    expect(sumMaxScores(works)).toBe(30);
    expect(sumMaxScores([])).toBe(0);
  });

  it('отбирает работы раздела и неразложенные', () => {
    expect(
      getSectionWorks(works, BarsSection.Labs).map((work) => work.id),
    ).toEqual([3, 7]);
    expect(getSectionWorks(works, null).map((work) => work.id)).toEqual([5]);
    expect(getSectionWorks(works, BarsSection.Exam)).toEqual([]);
  });

  it('id новой работы — следующий после самого большого', () => {
    expect(getNextWorkId(works)).toBe(8);
    expect(getNextWorkId([])).toBe(1);
  });

  it('из «Работ курса» работу можно перенести в любой раздел', () => {
    expect(getMoveTargets(null).map((target) => target.section)).toEqual([
      BarsSection.ClassWork,
      BarsSection.Labs,
      BarsSection.Tests,
      BarsSection.Midterm,
      BarsSection.Exam,
    ]);
  });

  it('из раздела — в любой другой или обратно в «Работы курса»', () => {
    const targets = getMoveTargets(BarsSection.Exam);

    expect(targets.map((target) => target.section)).not.toContain(
      BarsSection.Exam,
    );
    expect(targets.at(-1)).toEqual({
      section: null,
      title: 'Вернуть в работы курса',
    });
    expect(targets).toHaveLength(5);
  });
});
