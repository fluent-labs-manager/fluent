import type { BarsSection } from '@/types/BarsSection.ts';

// куда можно перенести работу: раздел БАРС или обратно в «Работы курса» (null)
export interface WorkMoveTarget {
  section: BarsSection | null;
  title: string;
}
