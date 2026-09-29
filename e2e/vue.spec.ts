import { test, expect } from '@playwright/test';

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Главная');
});

test('opens the courses page from the sidebar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Дисциплины' }).click();
  await expect(page).toHaveURL('/courses');
  await expect(page.locator('h1')).toHaveText('Дисциплины');
});
