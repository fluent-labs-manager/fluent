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
