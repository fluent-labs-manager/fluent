import { test, expect } from '@playwright/test';

test.describe('пустое состояние (?mock=empty)', () => {
  test('на странице дисциплин показывает «Дисциплин пока нет» без сводки', async ({
    page,
  }) => {
    await page.goto('/courses?mock=empty');

    await expect(page.getByText('Дисциплин пока нет.')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Прогресс семестра' }),
    ).toBeHidden();
    await expect(page.getByRole('main').getByRole('link')).toHaveCount(0);
  });

  test('на странице курса показывает название и «Лабораторных работ пока нет»', async ({
    page,
  }) => {
    await page.goto('/courses/1?mock=empty');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
    await expect(page.getByText('Лабораторных работ пока нет.')).toBeVisible();
  });
});
