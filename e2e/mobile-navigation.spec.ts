import { expect, test } from '@playwright/test';
import { drawer, menuToggle } from './helpers.ts';

test.describe('мобильная навигация', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('открывает меню со ссылками и данными текущего пользователя', async ({
    page,
  }) => {
    await page.goto('/?role=student');

    await expect(menuToggle(page)).toBeVisible();
    await expect(page.locator('.app-sidebar')).toBeHidden();
    await menuToggle(page).click();

    const mobileDrawer = drawer(page);
    await expect(mobileDrawer).toBeVisible();
    await expect(mobileDrawer).toContainText('Главная');
    await expect(mobileDrawer).toContainText('Дисциплины');
    await expect(mobileDrawer).toContainText('События');
    await expect(mobileDrawer).toContainText('Горелова Ульяна');
    await expect(mobileDrawer).toContainText('P3322');
  });

  test('закрывает меню после навигации', async ({ page }) => {
    await page.goto('/');
    await menuToggle(page).click();
    await drawer(page)
      .getByRole('link', { name: 'Дисциплины', exact: true })
      .click();

    await expect(page).toHaveURL('/courses');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дисциплины',
    );
    await expect(drawer(page)).toHaveCount(0);
  });

  test('закрывает меню по Escape, возвращает фокус на гамбургер', async ({
    page,
  }) => {
    await page.goto('/');
    await menuToggle(page).click();
    await expect(drawer(page).locator('a[href]').first()).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(drawer(page)).toHaveCount(0);
    await expect(menuToggle(page)).toBeFocused();
  });

  test('закрывает меню кликом по затемнённой области, но не кликом внутри панели', async ({
    page,
  }) => {
    await page.goto('/');
    await menuToggle(page).click();
    await drawer(page).locator('.mobile-navigation__drawer-logo').click();
    await expect(drawer(page)).toBeVisible();

    await page
      .locator('.mobile-navigation__backdrop')
      .click({ position: { x: 380, y: 420 } });

    await expect(drawer(page)).toHaveCount(0);
  });

  test('показывает role-aware меню преподавателя', async ({ page }) => {
    await page.goto('/?role=teacher');
    await menuToggle(page).click();

    const mobileDrawer = drawer(page);
    await expect(mobileDrawer).toContainText('Варианты');
    await expect(mobileDrawer).toContainText('Конструктор баллов');
    await expect(mobileDrawer).toContainText('Михайлюк Степан');
    await expect(
      mobileDrawer.getByRole('link', { name: 'Дисциплины', exact: true }),
    ).toHaveCount(0);
  });
});

test('на десктопной ширине остаётся боковая панель без мобильной шапки', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  await expect(page.locator('.app-sidebar')).toBeVisible();
  await expect(menuToggle(page)).toBeHidden();
  await expect(drawer(page)).toHaveCount(0);
});
