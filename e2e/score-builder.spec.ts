import { test, expect } from '@playwright/test';

import { menuLink } from './helpers.ts';

test.describe('конструктор баллов', () => {
  test('преподаватель открывает конструктор из меню', async ({ page }) => {
    await page.goto('/?role=teacher');

    await menuLink(page, 'Конструктор баллов').click();

    await expect(page).toHaveURL('/score-builder');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Конструктор баллов',
    );
    await expect(menuLink(page, 'Конструктор баллов')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('студента по прямой ссылке уводит на главную', async ({ page }) => {
    await page.goto('/score-builder?role=student');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Главная');
  });
});
