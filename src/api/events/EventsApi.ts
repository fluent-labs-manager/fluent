import { mockEventsData } from '@/mocks/events.ts';
import { getMockMode, mockDelay } from '@/mocks/mockMode.ts';
import type { EventsPageData } from '@/api/events/Event.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

export async function getStudentEventsStub(): Promise<EventsPageData> {
  await mockDelay();

  const mode = getMockMode();
  if (mode === 'error') {
    throw new ApiRequestError(503, 'Сервис временно недоступен');
  }

  if (mode === 'empty') {
    return {
      currentMonth: 'Октябрь 2026',
      plannedEventsCount: 0,
      upcomingMilestone: {
        title: 'Нет ближайших точек',
        dateText: '—',
        room: '—',
      },
      events: [],
    };
  }

  return structuredClone(mockEventsData);
}
