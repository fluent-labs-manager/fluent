#!/usr/bin/env bash
set -euo pipefail

mkdir -p src/api

cat > src/api/api.conf.ts <<EOF
export default {
  apiUrl: '${VITE_API_URL:-https://test-api.ru}',
  apiSocketUrl: '${VITE_API_SOCKET_URL:-wss://test-api.ru}',
  testApiUrl: '${VITE_TEST_API_URL:-https://test-api.ru}',
  testApiKey: '${VITE_TEST_API_KEY:-dummy_api_key}',
};
EOF