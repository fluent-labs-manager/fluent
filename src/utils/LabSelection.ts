import type { Lab, SelectableLab } from '@/api/labs/Lab.dto.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { getDeadlineState } from '@/utils/DeadlineState.ts';

export function isSelectableLab(lab: Lab): lab is SelectableLab {
  return lab.status !== LabStatus.Locked;
}

function byDeadline(first: SelectableLab, second: SelectableLab): number {
  return (
    new Date(first.deadline).getTime() - new Date(second.deadline).getTime() ||
    first.number - second.number
  );
}

function byNumber(first: SelectableLab, second: SelectableLab): number {
  return first.number - second.number;
}

// работа, которую карточка показывает, пока студент ничего не выбрал:
// 1. несданная с ближайшим ещё не прошедшим сроком;
// 2. несданная с прошедшим сроком — чтобы карточка не перескакивала на другую
//    работу, когда срок истекает на открытой странице;
// 3. самая ранняя по номеру из остальных
export function getDefaultLab(
  labs: SelectableLab[],
  now: Date,
): SelectableLab | null {
  const notSubmitted = labs.filter(
    (lab) => lab.status === LabStatus.NotSubmitted,
  );
  const [upcoming] = notSubmitted
    .filter((lab) => getDeadlineState(lab.deadline, now) !== 'overdue')
    .sort(byDeadline);
  const [overdue] = notSubmitted.sort(byDeadline);
  const [first] = [...labs].sort(byNumber);

  return upcoming ?? overdue ?? first ?? null;
}
