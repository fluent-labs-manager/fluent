import { test, expect } from '@playwright/test';

import { courseCard, menuLink } from './helpers.ts';

test.describe('навигация по боковому меню', () => {
  test('ведёт с главной на дисциплины и обратно, отмечая текущий раздел', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Главная');
    await expect(menuLink(page, 'Главная')).toHaveAttribute(
      'aria-current',
      'page',
    );

    await menuLink(page, 'Дисциплины').click();
    await expect(page).toHaveURL('/courses');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дисциплины',
    );
    await expect(menuLink(page, 'Дисциплины')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(menuLink(page, 'Главная')).not.toHaveAttribute('aria-current');

    await menuLink(page, 'Главная').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Главная');
  });

  test('проходит по всем трём страницам и возвращается на главную со страницы курса', async ({
    page,
  }) => {
    await page.goto('/');

    await menuLink(page, 'Дисциплины').click();
    await courseCard(page, 'Нейроинформатика').click();
    await expect(page).toHaveURL('/courses/2');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Нейроинформатика',
    );

    await menuLink(page, 'Главная').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Главная');
  });

  test('показывает пользователя в меню на любой странице', async ({ page }) => {
    for (const path of ['/', '/courses', '/courses/1']) {
      await page.goto(path);
      await expect(page.getByRole('complementary')).toContainText(
        'Горелова Ульяна',
      );
    }
  });
});
