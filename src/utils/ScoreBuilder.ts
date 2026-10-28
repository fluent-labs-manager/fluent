import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import {
  BARS_SECTION_LABELS,
  BARS_SECTION_ORDER,
} from '@/constants/barsSections.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import type { WorkMoveTarget } from '@/types/WorkMoveTarget.ts';

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

// куда можно перенести работу из раздела current (null — из «Работ курса»):
// в любой другой раздел и, если она уже разложена, обратно в «Работы курса»
export function getMoveTargets(current: BarsSection | null): WorkMoveTarget[] {
  const sections = BARS_SECTION_ORDER.filter(
    (section) => section !== current,
  ).map((section) => ({ section, title: BARS_SECTION_LABELS[section] }));
  return current === null
    ? sections
    : [...sections, { section: null, title: 'Вернуть в работы курса' }];
}
