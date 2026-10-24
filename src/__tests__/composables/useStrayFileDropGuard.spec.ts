import { afterEach, describe, expect, it } from 'vitest';

import { effectScope } from 'vue';
import type { EffectScope } from 'vue';
import { useStrayFileDropGuard } from '@/composables/useStrayFileDropGuard.ts';

// в jsdom нет DragEvent: обычное отменяемое событие с dataTransfer
function dispatchDrag(
  target: EventTarget,
  type: 'dragover' | 'drop',
): { event: Event; dataTransfer: { dropEffect: string } } {
  const dataTransfer = { dropEffect: 'copy' };
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  target.dispatchEvent(event);
  return { event, dataTransfer };
}

describe('useStrayFileDropGuard', () => {
  let scope: EffectScope | null = null;

  afterEach(() => {
    scope?.stop();
    scope = null;
    document.body.innerHTML = '';
  });

  function startGuard(): void {
    scope = effectScope();
    scope.run(() => {
      useStrayFileDropGuard();
    });
  }

  it('файл мимо области не открывается браузером', () => {
    startGuard();

    const dragOver = dispatchDrag(document.body, 'dragover');
    const drop = dispatchDrag(document.body, 'drop');

    expect(dragOver.event.defaultPrevented).toBe(true);
    expect(dragOver.dataTransfer.dropEffect).toBe('none');
    expect(drop.event.defaultPrevented).toBe(true);
  });

  it('событие, которое обработала область загрузки, не трогает', () => {
    startGuard();
    const zone = document.createElement('div');
    document.body.append(zone);
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    const { dataTransfer } = dispatchDrag(zone, 'dragover');

    expect(dataTransfer.dropEffect).toBe('copy');
  });

  it('после ухода со страницы перестаёт перехватывать события', () => {
    startGuard();
    scope?.stop();

    expect(dispatchDrag(document.body, 'drop').event.defaultPrevented).toBe(
      false,
    );
  });
});
