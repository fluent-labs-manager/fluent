import { describe, expect, it, vi } from 'vitest';

import { useWorkDropTarget } from '@/composables/useWorkDropTarget.ts';
import {
  createDataTransfer,
  dispatchDrag,
  workDragData,
} from '../dragEvents.ts';

// область с обработчиками, как после v-on="dropHandlers"
function createZone(onDrop: (workId: number) => void): {
  zone: HTMLElement;
  isDragOver: () => boolean;
} {
  const zone = document.createElement('div');
  const { isDragOver, dropHandlers } = useWorkDropTarget(onDrop);
  for (const [type, handler] of Object.entries(dropHandlers)) {
    zone.addEventListener(type, handler as EventListener);
  }
  return { zone, isDragOver: () => isDragOver.value };
}

describe('useWorkDropTarget', () => {
  it('принимает перетащенную работу и сообщает её id', () => {
    const onDrop = vi.fn();
    const { zone } = createZone(onDrop);
    const data = workDragData(7);

    const over = dispatchDrag(zone, 'dragover', data);
    const drop = dispatchDrag(zone, 'drop', data);

    expect(over.defaultPrevented).toBe(true);
    expect(data.dropEffect).toBe('move');
    expect(drop.defaultPrevented).toBe(true);
    expect(onDrop).toHaveBeenCalledWith(7);
  });

  it('файлы и текст не принимает', () => {
    const onDrop = vi.fn();
    const { zone, isDragOver } = createZone(onDrop);
    const data = createDataTransfer({ Files: '' });

    dispatchDrag(zone, 'dragenter', data);
    const over = dispatchDrag(zone, 'dragover', data);
    dispatchDrag(zone, 'drop', data);

    expect(over.defaultPrevented).toBe(false);
    expect(isDragOver()).toBe(false);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('подсветка не гаснет при переходе между вложенными элементами', () => {
    const { zone, isDragOver } = createZone(vi.fn());
    const data = workDragData(1);

    dispatchDrag(zone, 'dragenter', data);
    // курсор зашёл на чип внутри области и ушёл с самой области
    dispatchDrag(zone, 'dragenter', data);
    dispatchDrag(zone, 'dragleave', data);
    expect(isDragOver()).toBe(true);

    dispatchDrag(zone, 'dragleave', data);
    expect(isDragOver()).toBe(false);
  });

  it('после броска подсветка гаснет', () => {
    const { zone, isDragOver } = createZone(vi.fn());
    const data = workDragData(1);

    dispatchDrag(zone, 'dragenter', data);
    dispatchDrag(zone, 'dragenter', data);
    dispatchDrag(zone, 'drop', data);

    expect(isDragOver()).toBe(false);
  });

  it('без id работы ничего не сообщает', () => {
    const onDrop = vi.fn();
    const { zone } = createZone(onDrop);

    dispatchDrag(zone, 'drop', workDragData(Number.NaN));

    expect(onDrop).not.toHaveBeenCalled();
  });
});
