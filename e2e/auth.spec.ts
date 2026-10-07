import { test, expect } from '@playwright/test';

test('auth page login flow', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@university.ru');
  await page.fill('input[type="password"]', 'Password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});
