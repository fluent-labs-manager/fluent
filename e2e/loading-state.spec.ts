import { test, expect } from '@playwright/test';

import { courseCard } from './helpers.ts';

// Заглушки API отвечают через 700 мс (src/mocks/mockMode.ts): автоожиданий
// expect хватает, чтобы застать индикатор, — проверено с замедлением в 6 раз
test.describe('состояние загрузки', () => {
  test('на странице дисциплин показывает индикатор, пока данные не пришли, затем карточки', async ({
    page,
  }) => {
    await page.goto('/courses');

    await expect(page.getByRole('status')).toHaveText('Загрузка дисциплин…');

    await expect(courseCard(page, 'Разработка веб-приложений')).toBeVisible();
    await expect(page.getByRole('status')).toBeHidden();
  });

  test('на странице курса показывает индикатор, пока данные не пришли, затем работы', async ({
    page,
  }) => {
    await page.goto('/courses/1');

    await expect(page.getByRole('status')).toHaveText(
      'Загрузка лабораторных работ…',
    );

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
    await expect(page.getByRole('status')).toBeHidden();
  });
});
