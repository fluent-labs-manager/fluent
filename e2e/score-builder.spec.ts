import { test, expect } from '@playwright/test';

import { dragAndDrop, menuLink } from './helpers.ts';

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

test.describe('конструктор баллов: работы и разделы БАРС', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/score-builder?role=teacher');
    await page
      .getByLabel('Дисциплина', { exact: true })
      .selectOption({ label: 'Разработка веб-приложений' });
  });

  test('работу переносят в раздел через список у чипа', async ({ page }) => {
    const pool = page.getByRole('region', { name: 'Работы курса' });
    const labs = page.getByRole('region', {
      name: 'Лабораторные работы',
      exact: true,
    });
    await expect(page.getByText('Распределено 40 из 100')).toBeVisible();
    await expect(labs.getByText('40 из 50')).toBeVisible();

    await pool.getByRole('button', { name: 'ЛР5, 10 баллов' }).click();
    await page.getByRole('menuitem', { name: 'Лабораторные работы' }).click();

    await expect(
      labs.getByRole('button', { name: 'ЛР5, 10 баллов' }),
    ).toBeVisible();
    await expect(labs.getByText('50 из 50')).toBeVisible();
    await expect(
      pool.getByRole('button', { name: 'ЛР5, 10 баллов' }),
    ).toHaveCount(0);
    await expect(page.getByText('Распределено 50 из 100')).toBeVisible();
  });

  test('работу можно перетащить в раздел и обратно', async ({ page }) => {
    const pool = page.getByRole('region', { name: 'Работы курса' });
    const exam = page.getByRole('region', { name: 'Экзамен', exact: true });

    await dragAndDrop(
      page,
      pool.getByRole('button', { name: 'Экзамен, 20 баллов' }),
      exam,
    );

    await expect(
      exam.getByRole('button', { name: 'Экзамен, 20 баллов' }),
    ).toBeVisible();
    await expect(exam.getByText('20 из 20')).toBeVisible();

    await dragAndDrop(
      page,
      exam.getByRole('button', { name: 'Экзамен, 20 баллов' }),
      pool,
    );

    await expect(
      pool.getByRole('button', { name: 'Экзамен, 20 баллов' }),
    ).toBeVisible();
    await expect(exam.getByText('0 из 20')).toBeVisible();
  });
});

test.describe('конструктор баллов: редактирование работ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/score-builder?role=teacher');
    await page
      .getByLabel('Дисциплина', { exact: true })
      .selectOption({ label: 'Разработка веб-приложений' });
  });

  test('преподаватель добавляет работу в «Работы курса»', async ({ page }) => {
    const pool = page.getByRole('region', { name: 'Работы курса' });

    await pool.getByRole('button', { name: 'Добавить работу' }).click();
    await pool.getByLabel('Название', { exact: true }).fill('ЛР6');
    await pool.getByLabel('Баллы', { exact: true }).fill('10');
    await pool.getByRole('button', { name: 'Добавить', exact: true }).click();

    await expect(
      pool.getByRole('button', { name: 'ЛР6, 10 баллов' }),
    ).toBeVisible();
  });

  test('занятое название не принимается', async ({ page }) => {
    const pool = page.getByRole('region', { name: 'Работы курса' });

    await pool.getByRole('button', { name: 'Добавить работу' }).click();
    await pool.getByLabel('Название', { exact: true }).fill('ЛР1');
    await pool.getByLabel('Баллы', { exact: true }).fill('10');
    await pool.getByRole('button', { name: 'Добавить', exact: true }).click();

    await expect(
      pool.getByText('Работа с таким названием уже есть'),
    ).toBeVisible();
  });

  test('баллы работы можно изменить, а работу — удалить', async ({ page }) => {
    const labs = page.getByRole('region', {
      name: 'Лабораторные работы',
      exact: true,
    });

    await labs.getByRole('button', { name: 'ЛР1, 10 баллов' }).click();
    await page.getByRole('menuitem', { name: 'Изменить баллы' }).click();
    await labs.getByLabel('ЛР1', { exact: true }).fill('15');
    await labs.getByRole('button', { name: 'Сохранить баллы' }).click();

    await expect(
      labs.getByRole('button', { name: 'ЛР1, 15 баллов' }),
    ).toBeVisible();
    await expect(labs.getByText('45 из 50')).toBeVisible();

    await labs.getByRole('button', { name: 'ЛР2, 10 баллов' }).click();
    await page.getByRole('menuitem', { name: 'Удалить работу' }).click();

    await expect(labs.getByRole('button', { name: /ЛР2/ })).toHaveCount(0);
    await expect(labs.getByText('35 из 50')).toBeVisible();
    await expect(page.getByText('Распределено 35 из 100')).toBeVisible();
  });
});

test.describe('конструктор баллов: предпросмотр ведомости', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/score-builder?role=teacher');
    await page
      .getByLabel('Дисциплина', { exact: true })
      .selectOption({ label: 'Разработка веб-приложений' });
  });

  test('по вкладке на группу, в таблице студенты и разложенные работы', async ({
    page,
  }) => {
    const preview = page.getByRole('region', {
      name: 'Предпросмотр ведомости',
    });
    const table = preview.getByRole('table');

    await expect(preview.getByRole('tab')).toHaveText(['P3322', 'P3323']);
    await expect(table).toContainText('Группа P3322 · 6 студентов');
    await expect(
      table.getByRole('columnheader', { name: 'Лабораторные работы' }),
    ).toBeVisible();
    await expect(table.getByRole('rowheader')).toHaveCount(6);

    await preview.getByRole('tab', { name: 'P3323' }).click();

    await expect(table).toContainText('Группа P3323 · 5 студентов');
    await expect(table.getByRole('rowheader')).toHaveCount(5);
  });

  test('работа, перенесённая в раздел, становится колонкой', async ({
    page,
  }) => {
    const table = page
      .getByRole('region', { name: 'Предпросмотр ведомости' })
      .getByRole('table');
    await expect(
      table.getByRole('columnheader', { name: /^Экзамен/ }),
    ).toHaveCount(0);

    await page
      .getByRole('region', { name: 'Работы курса' })
      .getByRole('button', { name: 'Экзамен, 20 баллов' })
      .click();
    await page.getByRole('menuitem', { name: 'Экзамен' }).click();

    await expect(
      table.getByRole('columnheader', { name: 'Экзамен из 20' }),
    ).toBeVisible();
  });

  test('снятая группа пропадает из вкладок', async ({ page }) => {
    await page.getByRole('checkbox', { name: /P3322/ }).uncheck();

    await expect(
      page
        .getByRole('region', { name: 'Предпросмотр ведомости' })
        .getByRole('tab'),
    ).toHaveText(['P3323']);
  });
});

test.describe('конструктор баллов: заглушки Google-таблицы', () => {
  test('импорт, экспорт и создание вкладок неактивны и подписаны', async ({
    page,
  }) => {
    await page.goto('/score-builder?role=teacher');
    await page
      .getByLabel('Дисциплина', { exact: true })
      .selectOption({ label: 'Разработка веб-приложений' });

    const importCard = page.getByRole('region', {
      name: 'Импорт Google Таблицы',
    });
    const exportCard = page.getByRole('region', {
      name: 'Экспорт Google Таблицы',
    });

    await expect(
      importCard.getByRole('button', { name: 'Импортировать таблицу' }),
    ).toBeDisabled();
    await expect(
      importCard.getByRole('textbox', { name: 'Ссылка на Google-таблицу' }),
    ).toBeDisabled();
    await expect(
      exportCard.getByRole('button', { name: 'Экспортировать таблицу' }),
    ).toBeDisabled();
    await expect(
      exportCard.getByRole('button', { name: 'Создать вкладки по группам' }),
    ).toBeDisabled();
    await expect(importCard.getByText('Будет доступно позже')).toBeVisible();
    await expect(exportCard.getByText('Будет доступно позже')).toBeVisible();
  });
});

test.describe('конструктор баллов: узкий экран', () => {
  test.beforeEach(async ({ page }) => {
    // ширина, при которой рядом с боковым меню остаётся узкая колонка
    await page.setViewportSize({ width: 760, height: 900 });
    await page.goto('/score-builder?role=teacher');
    await page
      .getByLabel('Дисциплина', { exact: true })
      .selectOption({ label: 'Разработка веб-приложений' });
    await expect(
      page.getByRole('region', { name: 'Предпросмотр ведомости' }),
    ).toBeVisible();
  });

  test('у страницы нет горизонтальной прокрутки, таблица прокручивается в своём блоке', async ({
    page,
  }) => {
    const hasPageScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasPageScroll).toBe(false);

    const panel = page.getByRole('tabpanel');
    const isPanelScrollable = await panel.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    );
    expect(isPanelScrollable).toBe(true);
  });

  test('меню чипа не выводит страницу за край экрана', async ({ page }) => {
    const pool = page.getByRole('region', { name: 'Работы курса' });

    await pool
      .getByRole('button', { name: 'Активность на занятиях, 10 баллов' })
      .click();
    await expect(page.getByRole('menu')).toBeVisible();

    const hasPageScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasPageScroll).toBe(false);
  });
});
