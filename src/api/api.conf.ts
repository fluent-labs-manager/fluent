const apiConf = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  apiSocketUrl: import.meta.env.VITE_API_SOCKET_URL as string,
  sentryDsnUrl: import.meta.env.VITE_SENTRY_DSN_URL as string,
};

export default apiConf;
