import { test, expect } from '@playwright/test';

test.describe('страница лабораторной по прямой ссылке', () => {
  test('у несданной работы — форма сдачи и история отклонённых попыток', async ({
    page,
  }) => {
    await page.goto('/courses/1/labs/102');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Лабораторная работа 2',
    );
    await expect(page.getByText('Перетащите файл или выберите')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Отправить работу на проверку' }),
    ).toBeDisabled();

    const attempts = page
      .getByRole('region', { name: 'История' })
      .getByRole('listitem');
    await expect(attempts).toHaveCount(2);
    await expect(attempts.first()).toContainText('Попытка 2 — 18.10.2026');
    await expect(attempts.first()).toContainText('Отклонено');
    await expect(attempts.last()).toContainText('Попытка 1 — 18.09.2026');
    await expect(attempts.last()).toContainText('gorelova_v1.pdf');
    await expect(attempts.last()).toContainText('1,9 МБ');
  });

  test('выбранный файл можно убрать и выбрать снова', async ({ page }) => {
    await page.goto('/courses/1/labs/102');
    const submit = page.getByRole('button', {
      name: 'Отправить работу на проверку',
    });
    const files = page.getByRole('region', { name: 'Файлы' });

    await page.locator('input[type="file"]').setInputFiles({
      name: 'gorelova_v3.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });

    await expect(files.getByText('gorelova_v3.pdf')).toBeVisible();
    await expect(submit).toBeEnabled();

    await page.getByRole('button', { name: 'Удалить файл' }).click();

    await expect(files.getByText('gorelova_v3.pdf')).toHaveCount(0);
    await expect(page.getByText('Перетащите файл или выберите')).toBeVisible();
    await expect(submit).toBeDisabled();
  });

  test('работа на проверке открывается только для просмотра', async ({
    page,
  }) => {
    await page.goto('/courses/2/labs/202');

    await expect(page.getByText('На проверке').first()).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Файлы' })
        .getByText('gradient_descent.ipynb'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Отправить работу на проверку' }),
    ).toHaveCount(0);
  });

  test('недоступная работа показывает сообщение без формы', async ({
    page,
  }) => {
    await page.goto('/courses/1/labs/103');

    await expect(page.getByText('Работа пока недоступна')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Файлы' })).toHaveCount(0);

    await page.getByRole('link', { name: 'Назад' }).click();

    await expect(page).toHaveURL('/courses/1?lab=103');
  });

  test('несуществующая работа показывает ошибку', async ({ page }) => {
    await page.goto('/courses/1/labs/999');

    await expect(page.getByRole('alert')).toContainText('Работа не найдена');
  });
});

test.describe('отправка работы на проверку', () => {
  test('после отправки работа на проверке здесь и на странице дисциплины', async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-10-24T16:40:00+03:00'));
    await page.goto('/courses/1/labs/102');
    const submit = page.getByRole('button', {
      name: 'Отправить работу на проверку',
    });

    await page.locator('input[type="file"]').setInputFiles({
      name: 'gorelova_v3.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });
    await page.getByLabel('Комментарий к работе').fill('Исправил формы.');
    await submit.click();

    // пока файл грузится, второй раз отправить нельзя
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(submit).toBeDisabled();

    await expect(
      page
        .getByRole('region', { name: 'Файлы' })
        .getByText('На проверке', { exact: true }),
    ).toBeVisible();
    await expect(submit).toHaveCount(0);
    const attempts = page
      .getByRole('region', { name: 'История' })
      .getByRole('listitem');
    await expect(attempts).toHaveCount(3);
    await expect(attempts.first()).toContainText('Попытка 3 — 24.10.2026');
    await expect(attempts.first()).toContainText('На проверке');
    await expect(attempts.first()).toContainText('Исправил формы.');

    await page.getByRole('link', { name: 'Назад' }).click();

    await expect(page).toHaveURL('/courses/1?lab=102');
    await expect(
      page
        .getByRole('region', { name: 'Все работы дисциплины' })
        .getByRole('listitem')
        .filter({ hasText: 'Создание пользовательских интерфейсов' }),
    ).toContainText('ждёт оценки');
    await expect(
      page.getByRole('link', { name: 'Открыть работу' }),
    ).toBeVisible();
  });
});

test.describe('ошибки при сдаче', () => {
  test('файл другого типа не принимается', async ({ page }) => {
    await page.goto('/courses/1/labs/102');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'setup.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ'),
    });

    await expect(page.getByRole('alert')).toHaveText(
      'Этот тип файла не принимается. Можно: PDF, ZIP, IPYNB, PY, JAVA',
    );
    await expect(page.getByText('setup.exe')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Отправить работу на проверку' }),
    ).toBeDisabled();
  });

  test('файл больше 20 МБ не принимается', async ({ page }) => {
    await page.goto('/courses/1/labs/102');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'project.zip',
      mimeType: 'application/zip',
      buffer: Buffer.alloc(21 * 1024 * 1024),
    });

    await expect(page.getByRole('alert')).toHaveText('Файл больше 20 МБ');
  });

  test('пустой файл не принимается', async ({ page }) => {
    await page.goto('/courses/1/labs/102');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'otchet.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(0),
    });

    await expect(page.getByRole('alert')).toHaveText('Файл пустой');
    await expect(
      page.getByRole('button', { name: 'Отправить работу на проверку' }),
    ).toBeDisabled();
  });

  test('после сбоя загрузки повтор отправляет работу', async ({ page }) => {
    await page.goto('/courses/1/labs/102?mock=upload-error');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'gorelova_v3.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });
    await page
      .getByRole('button', { name: 'Отправить работу на проверку' })
      .click();

    await expect(page.getByRole('alert')).toContainText(
      'Загрузка файла прервалась',
    );
    await expect(page.getByText('gorelova_v3.pdf')).toBeVisible();

    await page.getByRole('button', { name: 'Повторить отправку' }).click();

    await expect(
      page
        .getByRole('region', { name: 'Файлы' })
        .getByText('На проверке', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
