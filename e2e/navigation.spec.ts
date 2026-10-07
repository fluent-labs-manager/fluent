import { test, expect } from '@playwright/test';

test('навигация по основным разделам', async ({ page }): Promise<void> => {
  // допустим мы залогинены или просто переходим на главную
  await page.goto('/');

  //проверяем главную
  await expect(page.locator('.home-page__title')).toHaveText('Главная');

  // клик по Дисциплины
  await page.getByRole('link', { name: 'Дисциплины' }).click();

  await expect(page).toHaveURL('/courses');
  await expect(page.locator('.courses-page__title')).toHaveText('Дисциплины');
});
