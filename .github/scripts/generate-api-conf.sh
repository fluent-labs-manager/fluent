#!/usr/bin/env bash
set -euo pipefail

mkdir -p src/api

cat > src/api/api.conf.ts <<EOF
export default {
  apiUrl: '${VITE_API_URL:-https://test-api.ru}',
  apiSocketUrl: '${VITE_API_SOCKET_URL:-wss://test-api.ru}',
  sentryDsnUrl: '${SENTRY_DSN_URL:-https://dummy-dsl.ingest.de.sentry.io}',
  testApiUrl: '${VITE_TEST_API_URL:-https://test-api.ru}',
  testApiKey: '${VITE_TEST_API_KEY:-dummy_api_key}',
};
EOF