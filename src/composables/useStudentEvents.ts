import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { getStudentEventsStub } from '@/api/events/EventsApi.ts';
import type { EventsPageData, StudentEvent } from '@/api/events/Event.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseStudentEventsResult {
  data: Ref<EventsPageData | null>;
  events: Ref<StudentEvent[]>;
  activeEvents: Ref<StudentEvent[]>;
  hideRead: Ref<boolean>;
  showArchive: Ref<boolean>;
  selectedDay: Ref<number | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
  toggleRead: (id: number) => void;
  toggleArchive: (id: number) => void;
}

export function useStudentEvents(): UseStudentEventsResult {
  const data = ref<EventsPageData | null>(null);
  const hideRead = ref<boolean>(false);
  const showArchive = ref<boolean>(false);
  const selectedDay = ref<number | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  const events = computed<StudentEvent[]>(() => data.value?.events ?? []);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      data.value = await getStudentEventsStub();
    } catch (loadError: unknown) {
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Неизвестная ошибка';
    } finally {
      isLoading.value = false;
    }
  }

  const activeEvents = computed<StudentEvent[]>(() => {
    let list = events.value;

    if (showArchive.value) {
      return list.filter((event) => event.isArchived);
    }

    list = list.filter((event) => !event.isArchived);

    if (hideRead.value) {
      list = list.filter((event) => !event.isRead);
    }

    if (selectedDay.value !== null) {
      list = list.filter((event) => event.dayNumber === selectedDay.value);
    }

    return list;
  });

  function toggleRead(id: number): void {
    const item = events.value.find((e) => e.id === id);
    if (item !== undefined) {
      item.isRead = !item.isRead;
    }
  }

  function toggleArchive(id: number): void {
    const item = events.value.find((e) => e.id === id);
    if (item !== undefined) {
      item.isArchived = !item.isArchived;
    }
  }

  void reload();

  return {
    data,
    events,
    activeEvents,
    hideRead,
    showArchive,
    selectedDay,
    isLoading,
    error,
    reload,
    toggleRead,
    toggleArchive,
  };
}
