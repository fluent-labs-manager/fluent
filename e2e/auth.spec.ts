import { test, expect } from '@playwright/test';

test('авторизация: успешный вход', async ({ page }): Promise<void> => {
  await page.goto('/auth');

  //заполняем корректыми данными
  await page.locator('#email').fill('test@university.ru');
  await page.locator('#password').fill('Password123');

  await page.locator('button[type="submit"]').click();

  //ожидаем переход на главную
  await expect(page).toHaveURL('/');
});

test('авторизация: проверка ошибок валидации', async ({
  page,
}): Promise<void> => {
  await page.goto('/auth');

  //вводим некорректный email
  await page.locator('#email').fill('wrong-email');
  await page.locator('#password').fill('123'); //короткий пароль
  await page.locator('button[type="submit"]').click();

  // нало чтоб появились сообщения об ошибках
  await expect(page.locator('.field-error')).toHaveCount(2);
  await expect(page.locator('.field-error').first()).toContainText(
    'Введите корректный email',
  );
});
