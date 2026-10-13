import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useCounterStore } from '@/stores/counter';

describe('useCounterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('увеличивает счётчик и пересчитывает doubleCount', () => {
    const counter = useCounterStore();

    expect(counter.count).toBe(0);
    expect(counter.doubleCount).toBe(0);

    counter.increment();

    expect(counter.count).toBe(1);
    expect(counter.doubleCount).toBe(2);
  });
});
