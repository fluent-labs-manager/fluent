import { test, expect } from '@playwright/test';

import { menuLink, userCard } from './helpers.ts';

test.describe('личный кабинет студента', () => {
  test('открывается из меню и показывает данные и текущие дисциплины', async ({
    page,
  }) => {
    await page.goto('/');
    await userCard(page).click();

    await expect(page).toHaveURL('/account');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Личный кабинет',
    );
    await expect(userCard(page)).toHaveAttribute('aria-current', 'page');

    const main = page.getByRole('main');
    await expect(main).toContainText('Горелова Ульяна');
    await expect(main).toContainText('Студент · P3322');
    await expect(main).toContainText('u.gorelova@niuitmo.ru');
    await expect(main).toContainText('Сдано работ');
    await expect(
      page.getByRole('heading', { name: 'Текущие дисциплины' }),
    ).toBeVisible();
  });

  test('ведёт из списка дисциплин на страницу курса', async ({ page }) => {
    await page.goto('/account');

    await page
      .getByRole('main')
      .getByRole('link', { name: 'Разработка веб-приложений' })
      .click();

    await expect(page).toHaveURL('/courses/1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
  });

  test('«Назад» возвращает на страницу, с которой пришли', async ({ page }) => {
    await page.goto('/courses');
    await userCard(page).click();
    await expect(page).toHaveURL('/account');

    await page.getByRole('button', { name: 'Назад' }).click();

    await expect(page).toHaveURL('/courses');
  });

  test('«Назад» при открытии по прямой ссылке ведёт на главную', async ({
    page,
  }) => {
    await page.goto('/account');

    await page.getByRole('button', { name: 'Назад' }).click();

    await expect(page).toHaveURL('/');
  });
});

test.describe('личный кабинет преподавателя (?role=teacher)', () => {
  test('после перехода из меню остаётся кабинетом преподавателя', async ({
    page,
  }) => {
    // роль задаётся один раз, ссылка в меню её из адреса теряет
    await page.goto('/?role=teacher');
    await userCard(page).click();

    await expect(page).toHaveURL('/account');
    const main = page.getByRole('main');
    await expect(main).toContainText('Михайлюк Степан');
    await expect(main).toContainText(
      'Факультет программной инженерии и компьютерной техники',
    );
    await expect(main).toContainText('Ждут проверки');
    await expect(
      page.getByRole('heading', { name: 'Мои дисциплины' }),
    ).toBeVisible();
    await expect(main).toContainText('Разработка веб-приложений');
    await expect(main).not.toContainText('Сдано работ');
    // страницы дисциплины для преподавателя ещё нет — строки не ссылки
    await expect(main.getByRole('link')).toHaveCount(0);
  });

  test('показывает меню преподавателя без раздела «Дисциплины»', async ({
    page,
  }) => {
    await page.goto('/account?role=teacher');

    await expect(menuLink(page, 'Главная')).toBeVisible();
    await expect(page.getByRole('navigation')).toContainText(
      'Конструктор баллов',
    );
    await expect(menuLink(page, 'Дисциплины')).toHaveCount(0);
  });

  test('со страницы дисциплин по прямой ссылке уводит на главную', async ({
    page,
  }) => {
    await page.goto('/courses?role=teacher');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Главная');
  });
});

test.describe('личный кабинет: ошибки и узкий экран', () => {
  test('при ошибке показывает её, а «Повторить» загружает данные', async ({
    page,
  }) => {
    await page.goto('/account?mock=error');
    await expect(page.getByRole('alert')).toHaveText(
      'Не удалось загрузить данные: Сервис временно недоступен',
    );

    // «сервер починился»: убираем ?mock=error, не перезагружая страницу
    await page.evaluate(() => {
      window.history.replaceState(window.history.state, '', '/account');
    });
    await page.getByRole('button', { name: 'Повторить' }).click();

    await expect(page.getByRole('main')).toContainText('Горелова Ульяна');
    await expect(page.getByRole('alert')).toBeHidden();
  });

  test('на узком экране не появляется горизонтальная прокрутка', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 760, height: 900 });
    await page.goto('/account?role=teacher');
    await expect(
      page.getByRole('heading', { name: 'Мои дисциплины' }),
    ).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
