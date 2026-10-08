import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { effectScope } from 'vue';
import type { EffectScope, Ref } from 'vue';
import { useNow } from '@/composables/useNow.ts';

const MINUTE_MS = 60 * 1000;

function setTabVisibility(state: DocumentVisibilityState): void {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useNow', () => {
  let scope: EffectScope;
  let now: Ref<Date>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-12T12:00:00+03:00'));
    scope = effectScope();
    scope.run(() => {
      now = useNow();
    });
  });

  afterEach(() => {
    scope.stop();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('сразу отдаёт текущее время', () => {
    expect(now.value).toEqual(new Date('2026-10-12T12:00:00+03:00'));
  });

  it('обновляет время раз в минуту', () => {
    vi.advanceTimersByTime(MINUTE_MS - 1);
    expect(now.value).toEqual(new Date('2026-10-12T12:00:00+03:00'));

    vi.advanceTimersByTime(1);
    expect(now.value).toEqual(new Date('2026-10-12T12:01:00+03:00'));

    vi.advanceTimersByTime(MINUTE_MS);
    expect(now.value).toEqual(new Date('2026-10-12T12:02:00+03:00'));
  });

  it('обновляет время, когда вкладка снова становится видимой', () => {
    vi.setSystemTime(new Date('2026-10-13T09:30:00+03:00'));

    setTabVisibility('hidden');
    expect(now.value).toEqual(new Date('2026-10-12T12:00:00+03:00'));

    setTabVisibility('visible');
    expect(now.value).toEqual(new Date('2026-10-13T09:30:00+03:00'));
  });

  it('после остановки перестаёт обновлять время', () => {
    scope.stop();
    vi.setSystemTime(new Date('2026-10-13T09:30:00+03:00'));

    vi.advanceTimersByTime(MINUTE_MS);
    setTabVisibility('visible');

    expect(now.value).toEqual(new Date('2026-10-12T12:00:00+03:00'));
    expect(vi.getTimerCount()).toBe(0);
  });
});
