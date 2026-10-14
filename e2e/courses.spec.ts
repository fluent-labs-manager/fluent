import { test, expect } from '@playwright/test';

import { courseCard, courseCards } from './helpers.ts';

test.describe('страница «Дисциплины»', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/courses');
    await expect(courseCards(page)).toHaveCount(4);
  });

  test('переключает текущий семестр и все семестры', async ({ page }) => {
    const semesters = page.getByRole('group', { name: 'Семестр' });
    const current = semesters.getByRole('button', { name: 'Осень 2026' });
    const all = semesters.getByRole('button', { name: 'Все семестры' });
    const summary = page.getByRole('heading', { name: 'Прогресс семестра' });

    await expect(current).toHaveAttribute('aria-pressed', 'true');
    await expect(summary).toBeVisible();
    await expect(courseCard(page, 'Компьютерные сети')).toBeHidden();

    await all.click();
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await expect(current).toHaveAttribute('aria-pressed', 'false');
    await expect(courseCards(page)).toHaveCount(5);
    await expect(courseCard(page, 'Компьютерные сети')).toBeVisible();
    await expect(summary).toBeHidden();

    await current.click();
    await expect(courseCards(page)).toHaveCount(4);
    await expect(courseCard(page, 'Компьютерные сети')).toBeHidden();
    await expect(summary).toBeVisible();
  });

  test('открывает курс прошлого семестра из вкладки «Все семестры»', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Все семестры' }).click();
    await courseCard(page, 'Компьютерные сети').click();

    await expect(page).toHaveURL('/courses/5');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Компьютерные сети',
    );
  });

  test('открывает страницу курса кликом по карточке и возвращает кнопкой «назад»', async ({
    page,
  }) => {
    await courseCard(page, 'Разработка веб-приложений').click();
    await expect(page).toHaveURL('/courses/1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );

    await page.getByRole('link', { name: 'К дисциплинам' }).click();
    await expect(page).toHaveURL('/courses');
    await expect(courseCards(page)).toHaveCount(4);
  });

  test('возвращается со страницы курса кнопкой «Назад» браузера и снова переходит вперёд', async ({
    page,
  }) => {
    await courseCard(page, 'Базы данных').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Базы данных',
    );

    await page.goBack();
    await expect(page).toHaveURL('/courses');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дисциплины',
    );
    await expect(courseCards(page)).toHaveCount(4);

    await page.goForward();
    await expect(page).toHaveURL('/courses/4');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Базы данных',
    );
  });
});
