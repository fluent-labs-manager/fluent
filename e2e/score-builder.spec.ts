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

test.describe('конструктор баллов: дисциплина и группы', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/score-builder?role=teacher');
  });

  test('сначала нужно выбрать дисциплину, после выбора отмечены все её группы', async ({
    page,
  }) => {
    const course = page.getByLabel('Дисциплина', { exact: true });
    await expect(
      page.getByText(
        'Выберите дисциплину — после этого появятся её группы и работы.',
      ),
    ).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);

    await course.selectOption({ label: 'Разработка веб-приложений' });

    await expect(page.getByRole('checkbox', { name: /P3322/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /P3323/ })).toBeChecked();
  });

  test('отметки групп сохраняются при возврате к дисциплине', async ({
    page,
  }) => {
    const course = page.getByLabel('Дисциплина', { exact: true });
    await course.selectOption({ label: 'Разработка веб-приложений' });
    await page.getByRole('checkbox', { name: /P3323/ }).uncheck();

    await course.selectOption({ label: 'Технологии программирования' });
    await expect(page.getByRole('checkbox')).toHaveCount(3);

    await course.selectOption({ label: 'Разработка веб-приложений' });
    await expect(page.getByRole('checkbox', { name: /P3322/ })).toBeChecked();
    await expect(
      page.getByRole('checkbox', { name: /P3323/ }),
    ).not.toBeChecked();
  });
});
