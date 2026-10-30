import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { getReviewQueueStub } from '@/api/labs/LabsApi.ts';
import type { ReviewQueueItem } from '@/api/labs/ReviewQueue.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

interface UseReviewQueueResult {
  queue: Ref<ReviewQueueItem[]>;
  filteredQueue: Ref<ReviewQueueItem[]>;
  selectedCourseId: Ref<number | 'all'>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
  removeItem: (id: number) => void;
}

export function useReviewQueue(): UseReviewQueueResult {
  const queue = ref<ReviewQueueItem[]>([]);
  const selectedCourseId = ref<number | 'all'>('all');
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  async function reload(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      queue.value = await getReviewQueueStub();
    } catch (loadError: unknown) {
      error.value =
        loadError instanceof ApiRequestError
          ? loadError.message
          : 'Неизвестная ошибка';
    } finally {
      isLoading.value = false;
    }
  }

  const filteredQueue = computed<ReviewQueueItem[]>(() => {
    if (selectedCourseId.value === 'all') {
      return queue.value;
    }
    return queue.value.filter(
      (item) => item.courseId === selectedCourseId.value,
    );
  });

  function removeItem(id: number): void {
    queue.value = queue.value.filter((item) => item.id !== id);
  }

  void reload();

  return {
    queue,
    filteredQueue,
    selectedCourseId,
    isLoading,
    error,
    reload,
    removeItem,
  };
}
