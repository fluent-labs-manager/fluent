import { test, expect } from '@playwright/test';

test('регистрация: выбор роли и переход к деталям', async ({
  page,
}): Promise<void> => {
  await page.goto('/register');

  //проверяем заголовок
  await expect(page.locator('.title')).toHaveText('Регистрация');

  //выбираем преподаватель (он добавит класс role-option--selected)
  await page.locator('.role-option').nth(1).click();
  await expect(page.locator('.role-option').nth(1)).toHaveClass(
    /role-option--selected/,
  );

  //проверяем ФИО
  const fioInput = page.locator('#fullName');
  await fioInput.fill('Иван Иванов');

  // клик  продолжить
  await page.locator('.submit-btn').click();

  // проверяем переход
  await expect(page).toHaveURL('/registration-details');
});

test('регистрация: ошибка при пустом ФИО', async ({ page }): Promise<void> => {
  await page.goto('/register');

  //очищаем ФИОО
  await page.locator('#fullName').fill('');
  await page.locator('.submit-btn').click();

  // ожидаем ошибку
  await expect(page.locator('.field-error')).toHaveText('Введите ФИО');
});
