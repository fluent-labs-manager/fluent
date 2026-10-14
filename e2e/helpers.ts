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
