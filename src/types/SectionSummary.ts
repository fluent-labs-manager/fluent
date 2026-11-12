import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import type { BarsSection } from '@/types/BarsSection.ts';

// раздел БАРС с разложенными в него работами
export interface SectionSummary {
  section: BarsSection;
  title: string;
  limit: number;
  // сумма баллов разложенных в раздел работ
  score: number;
  isOverLimit: boolean;
  works: GradebookWork[];
}
