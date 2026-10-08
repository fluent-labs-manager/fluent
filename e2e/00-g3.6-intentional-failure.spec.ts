import { expect, test } from '@playwright/test';

test.describe('G3.6 — intentional e2e failure', () => {
  // This PR must remain red: it demonstrates that a failed e2e test blocks CI.
  test.describe.configure({ retries: 0 });

  test('blocks the pipeline when the home page does not match expectations', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Намеренно неверный заголовок для проверки G3.6',
      { timeout: 500 },
    );
  });
});
