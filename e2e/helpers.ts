import type { Locator, Page } from '@playwright/test';

/** Пункт бокового меню по названию. */
export function menuLink(page: Page, name: string): Locator {
  return page.getByRole('navigation').getByRole('link', { name, exact: true });
}

/**
 * Карточка дисциплины на странице «Дисциплины» — ссылка, внутри которой
 * заголовок с названием курса.
 * У ссылки-карточки сейчас нет доступного имени. Когда у ссылки появится
 * aria-label, можно заменить на page.getByRole('link', { name: title }).
 */
export function courseCard(page: Page, title: string): Locator {
  return page
    .getByRole('main')
    .getByRole('link')
    .filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    });
}

/** Все карточки дисциплин на странице. */
export function courseCards(page: Page): Locator {
  return page.getByRole('main').getByRole('link');
}

/** Карточка пользователя внизу бокового меню — ссылка на личный кабинет. */
export function userCard(page: Page): Locator {
  return page.getByRole('complementary').getByTitle('Личный кабинет');
}

/**
 * Перетаскивание элемента в область. Имитация жеста мышью (dragTo или
 * mouse.down/move/up) в Chromium и WebKit на Windows до страницы не доходит,
 * поэтому события перетаскивания отправляются по порядку с настоящим
 * DataTransfer — так проверяются обработчики страницы в движке каждого
 * браузера. Сам жест даёт браузер по атрибуту draggable.
 */
export async function dragAndDrop(
  page: Page,
  source: Locator,
  target: Locator,
): Promise<void> {
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await source.dispatchEvent('dragstart', { dataTransfer });
  await target.dispatchEvent('dragenter', { dataTransfer });
  await target.dispatchEvent('dragover', { dataTransfer });
  await target.dispatchEvent('drop', { dataTransfer });
  // dragend не нужен: после броска элемент уже в другом месте страницы
  await dataTransfer.dispose();
}
