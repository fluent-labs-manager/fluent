import { ref } from 'vue';
import type { Ref } from 'vue';

import { WORK_DRAG_TYPE } from '@/constants/barsSections.ts';

interface WorkDropHandlers {
  dragenter: (event: DragEvent) => void;
  dragover: (event: DragEvent) => void;
  dragleave: (event: DragEvent) => void;
  drop: (event: DragEvent) => void;
}

interface UseWorkDropTargetResult {
  // над областью держат работу — её подсвечивают
  isDragOver: Ref<boolean>;
  // вешаются на область целиком: v-on="dropHandlers"
  dropHandlers: WorkDropHandlers;
}

function carriesWork(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes(WORK_DRAG_TYPE) ?? false;
}

// область, куда можно перетащить работу курса. Файлы и текст не принимает
export function useWorkDropTarget(
  onDrop: (workId: number) => void,
): UseWorkDropTargetResult {
  const isDragOver = ref<boolean>(false);
  // dragenter и dragleave приходят и от вложенных элементов: считаем
  // вложенность, чтобы подсветка не мигала при движении над чипами
  let depth = 0;

  function dragenter(event: DragEvent): void {
    if (!carriesWork(event)) {
      return;
    }
    event.preventDefault();
    depth += 1;
    isDragOver.value = true;
  }

  function dragover(event: DragEvent): void {
    if (!carriesWork(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function dragleave(event: DragEvent): void {
    if (!carriesWork(event)) {
      return;
    }
    depth = Math.max(0, depth - 1);
    if (depth === 0) {
      isDragOver.value = false;
    }
  }

  function drop(event: DragEvent): void {
    if (!carriesWork(event)) {
      return;
    }
    event.preventDefault();
    depth = 0;
    isDragOver.value = false;
    const workId = Number(event.dataTransfer?.getData(WORK_DRAG_TYPE));
    if (Number.isInteger(workId)) {
      onDrop(workId);
    }
  }

  return {
    isDragOver,
    dropHandlers: { dragenter, dragover, dragleave, drop },
  };
}
