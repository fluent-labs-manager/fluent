import type { BarsSection } from '@/types/BarsSection.ts';

// сколько баллов дисциплина отводит разделу БАРС
export interface SectionLimit {
  section: BarsSection;
  limit: number;
}
