import { flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { useStudentEvents } from '@/composables/useStudentEvents.ts';
import { mockEventsData } from '@/mocks/events.ts';

vi.mock('@/api/events/EventsApi.ts', () => ({
  getStudentEventsStub: vi.fn(() =>
    Promise.resolve(structuredClone(mockEventsData)),
  ),
}));

describe('useStudentEvents', (): void => {
  it('загружает события и позволяет переключать архив и прочитанные', async (): Promise<void> => {
    const { activeEvents, toggleArchive, toggleRead, showArchive, hideRead } =
      useStudentEvents();
    await flushPromises();

    expect(activeEvents.value.length).toBeGreaterThan(0);

    const firstId = activeEvents.value[0]?.id;
    if (firstId !== undefined) {
      toggleArchive(firstId);
      expect(activeEvents.value.find((e) => e.id === firstId)).toBeUndefined();

      showArchive.value = true;
      expect(activeEvents.value.find((e) => e.id === firstId)).toBeDefined();
    }

    showArchive.value = false;
    hideRead.value = true;
    expect(activeEvents.value.every((e) => !e.isRead)).toBe(true);

    if (firstId !== undefined) {
      toggleRead(firstId);
    }
  });
});
