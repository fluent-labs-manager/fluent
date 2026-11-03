import type { IsoDateTime } from '@/types/IsoDateTime.ts';

export type EventType =
  'lecture' | 'conference' | 'milestone' | 'consultation' | 'exam';

export interface StudentEvent {
  id: number;
  date: IsoDateTime;
  dayNumber: number;
  weekdayLabel: string;
  timeRange: string;
  type: EventType;
  typeLabel: string;
  title: string;
  locationOrUrl: string;
  isOnline: boolean;
  actionType: 'join' | 'details';
  linkUrl?: string;
  isRead: boolean;
  isArchived: boolean;
}

export interface UpcomingMilestone {
  title: string;
  dateText: string;
  room: string;
}

export interface EventsPageData {
  currentMonth: string;
  plannedEventsCount: number;
  upcomingMilestone: UpcomingMilestone;
  events: StudentEvent[];
}
