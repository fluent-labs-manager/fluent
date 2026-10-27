import { WORK_DRAG_TYPE } from '@/constants/barsSections.ts';

// в jsdom нет DragEvent и DataTransfer: обычное отменяемое событие
// с минимальным dataTransfer
export interface FakeDataTransfer {
  types: string[];
  dropEffect: string;
  effectAllowed: string;
  getData: (type: string) => string;
  setData: (type: string, value: string) => void;
}

export function createDataTransfer(
  data: Record<string, string> = {},
): FakeDataTransfer {
  const store = { ...data };
  return {
    get types(): string[] {
      return Object.keys(store);
    },
    dropEffect: 'none',
    effectAllowed: 'all',
    getData: (type): string => store[type] ?? '',
    setData: (type, value): void => {
      store[type] = value;
    },
  };
}

// данные, как при перетаскивании работы с этим id
export function workDragData(workId: number): FakeDataTransfer {
  return createDataTransfer({ [WORK_DRAG_TYPE]: String(workId) });
}

export function dispatchDrag(
  target: EventTarget,
  type: 'dragstart' | 'dragenter' | 'dragover' | 'dragleave' | 'drop',
  dataTransfer: FakeDataTransfer,
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  target.dispatchEvent(event);
  return event;
}
