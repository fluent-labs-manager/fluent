// помощники для заглушек API. Удалить вместе с заглушками из src/api/.
export type MockMode = 'data' | 'empty' | 'error';
export const MOCK_DELAY_MS = 700;

export function getMockMode(): MockMode {
  const mode = new URLSearchParams(window.location.search).get('mock');
  return mode === 'empty' || mode === 'error' ? mode : 'data';
}

export function mockDelay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
