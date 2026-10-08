import type { DeadlineState } from '@/types/DeadlineState.ts';
import type { IsoDateTime } from '@/types/IsoDateTime.ts';

// меньше трёх суток до срока — дедлайн близкий
const SOON_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export function getDeadlineState(
  deadline: IsoDateTime,
  now: Date = new Date(),
): DeadlineState {
  const timeLeft = new Date(deadline).getTime() - now.getTime();

  if (timeLeft < 0) {
    return 'overdue';
  }

  return timeLeft < SOON_THRESHOLD_MS ? 'soon' : 'normal';
}
