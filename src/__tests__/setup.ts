import { config } from '@vue/test-utils';

import { installPrimeVue } from '@/plugins/primevue.ts';

// компоненты PrimeVue работают только с подключённым плагином — как в main.ts
config.global.plugins.push({ install: installPrimeVue });
