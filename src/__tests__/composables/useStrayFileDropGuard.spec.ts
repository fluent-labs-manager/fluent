import { afterEach, describe, expect, it, vi } from 'vitest';

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
    vi.restoreAllMocks();
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

  // какие обработчики dragover сейчас висят на window
  function trackDragOverListeners(): Set<unknown> {
    const active = new Set<unknown>();
    const add = window.addEventListener.bind(window);
    const remove = window.removeEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        if (type === 'dragover') {
          active.add(listener);
        }
        add(type, listener, options);
      },
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type, listener, options) => {
        if (type === 'dragover') {
          active.delete(listener);
        }
        remove(type, listener, options);
      },
    );
    return active;
  }

  it('при повторных заходах на страницу обработчики не накапливаются', () => {
    const active = trackDragOverListeners();

    for (let visit = 1; visit <= 3; visit += 1) {
      startGuard();
      expect(active.size).toBe(1);
      scope?.stop();
      expect(active.size).toBe(0);
    }
  });

  it('повторный вызов передаёт браузеру тот же обработчик', () => {
    const active = trackDragOverListeners();

    startGuard();
    const first = scope;
    startGuard();

    // браузер не добавляет одну и ту же функцию дважды
    expect(active.size).toBe(1);
    first?.stop();
  });

  it('после ухода со страницы перестаёт перехватывать события', () => {
    startGuard();
    scope?.stop();

    expect(dispatchDrag(document.body, 'drop').event.defaultPrevented).toBe(
      false,
    );
  });
});
