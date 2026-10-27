import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import type { BarsSection } from '@/types/BarsSection.ts';

// сумма максимальных баллов работ
export function sumMaxScores(works: GradebookWork[]): number {
  return works.reduce((sum, work) => sum + work.maxScore, 0);
}

// работы раздела; null — ещё не разложенные
export function getSectionWorks(
  works: GradebookWork[],
  section: BarsSection | null,
): GradebookWork[] {
  return works.filter((work) => work.section === section);
}

// id для новой работы: следующий после самого большого
export function getNextWorkId(works: GradebookWork[]): number {
  return works.reduce((max, work) => Math.max(max, work.id), 0) + 1;
}
