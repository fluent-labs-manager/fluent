import { vi } from 'vitest';

import { config } from '@vue/test-utils';

import { installPrimeVue } from '@/plugins/primevue.ts';

// компоненты PrimeVue работают только с подключённым плагином — как в main.ts
config.global.plugins.push({ install: installPrimeVue });

// в jsdom нет ResizeObserver, а вкладки PrimeVue следят им за шириной ряда
if (typeof window.ResizeObserver !== 'function') {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = (): void => undefined;
      unobserve = (): void => undefined;
      disconnect = (): void => undefined;
    },
  );
}

// и нет matchMedia, а Select подписывается через него на поворот экрана
if (typeof window.matchMedia !== 'function') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: (): void => undefined,
    removeEventListener: (): void => undefined,
  }));
}
