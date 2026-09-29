import type { SemesterFilter } from '@/types/SemesterFilter.ts';

// переключатель семестров
export interface SemesterFilterOption {
  value: SemesterFilter;
  label: string;
}
