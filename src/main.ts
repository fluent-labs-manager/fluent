import './assets/base.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import * as Sentry from '@sentry/vue';
import apiConf from '@/api/api.conf.ts';

const app = createApp(App);

Sentry.init({
  app,
  dsn: apiConf.sentryDsnUrl,
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
  tracePropagationTargets: ['localhost', apiConf.apiUrl],
  environment: 'production',
});

app.use(createPinia());
app.use(router);

app.mount('#app');
