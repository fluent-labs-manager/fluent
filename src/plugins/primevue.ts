import type { App } from 'vue';

import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

// тема Aura в цветах проекта: компоненты берут цвета из токенов base.css.
// palette нужен hex, чтобы построить шкалу оттенков, — это --color-accent
const FluentPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#5d6b4f'),
  },
  components: {
    progressbar: {
      root: {
        background: 'var(--color-muted-surface)',
        borderRadius: '0.25rem',
        height: '0.5rem',
      },
      value: {
        background: 'var(--color-accent)',
      },
    },
    message: {
      colorScheme: {
        light: {
          error: {
            background: 'var(--color-error-surface)',
            borderColor: 'var(--color-error-surface)',
            color: 'var(--color-error)',
            shadow: 'none',
          },
        },
      },
    },
    // по умолчанию спиннер переливается четырьмя цветами
    progressspinner: {
      colorScheme: {
        light: {
          root: {
            colorOne: 'var(--color-accent)',
            colorTwo: 'var(--color-accent)',
            colorThree: 'var(--color-accent)',
            colorFour: 'var(--color-accent)',
          },
        },
      },
    },
    tooltip: {
      root: {
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
      },
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-accent)',
            color: 'var(--color-surface)',
          },
        },
      },
      // у подсказки нет токена размера шрифта
      css: '.p-tooltip-text { font-size: 0.75rem; }',
    },
    togglebutton: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-accent-surface)',
            checkedBackground: 'var(--color-accent-surface)',
            hoverBackground: 'var(--color-accent-surface)',
            borderColor: 'var(--color-accent-surface)',
            checkedBorderColor: 'var(--color-accent-surface)',
            color: 'var(--color-text-secondary)',
            hoverColor: 'var(--color-text)',
            checkedColor: 'var(--color-text)',
          },
          content: {
            checkedBackground: 'var(--color-surface)',
          },
        },
      },
    },
  },
});

export function installPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: FluentPreset,
      // тёмной темы у приложения нет: без этого компоненты темнеют вслед за системой
      options: { darkModeSelector: '.app-dark' },
    },
  });
  app.directive('tooltip', Tooltip);
}
