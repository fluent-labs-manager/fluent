import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { courseCard } from './helpers.ts';

/**
 * «Сервер починился»: убираем ?mock=error из адреса, не перезагружая страницу.
 * Заглушки читают режим из адреса при каждом запросе, поэтому следующий
 * запрос — по кнопке «Повторить» — пройдёт успешно.
 */
async function recoverServer(page: Page, path: string): Promise<void> {
  await page.evaluate((cleanPath) => {
    window.history.replaceState(window.history.state, '', cleanPath);
  }, path);
}

test.describe('ошибка загрузки (?mock=error) и кнопка «Повторить»', () => {
  test('на странице дисциплин показывает ошибку, а «Повторить» загружает данные заново', async ({
    page,
  }) => {
    await page.goto('/courses?mock=error');
    await expect(page.getByRole('alert')).toHaveText(
      'Не удалось загрузить дисциплины: Сервис временно недоступен',
    );

    await recoverServer(page, '/courses');
    await page.getByRole('button', { name: 'Повторить' }).click();

    // кнопка запускает новый запрос: снова виден индикатор загрузки
    await expect(page.getByRole('status')).toHaveText('Загрузка дисциплин…');
    await expect(courseCard(page, 'Разработка веб-приложений')).toBeVisible();
    await expect(page.getByRole('alert')).toBeHidden();
  });

  test('пока ошибка повторяется, «Повторить» снова показывает ошибку', async ({
    page,
  }) => {
    await page.goto('/courses?mock=error');
    await expect(page.getByRole('alert')).toBeVisible();

    await page.getByRole('button', { name: 'Повторить' }).click();

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText(
      'Не удалось загрузить дисциплины: Сервис временно недоступен',
    );
  });

  test('на странице курса показывает ошибку, а «Повторить» загружает работы', async ({
    page,
  }) => {
    await page.goto('/courses/1?mock=error');
    await expect(page.getByRole('alert')).toHaveText(
      'Не удалось загрузить лабораторные работы: Сервис временно недоступен',
    );

    await recoverServer(page, '/courses/1');
    await page.getByRole('button', { name: 'Повторить' }).click();

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
    await expect(page.getByRole('alert')).toBeHidden();
  });
});
