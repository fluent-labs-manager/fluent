import { test, expect, type Page } from '@playwright/test';

import { courseCard } from './helpers.ts';

// числа на карточках и в личном кабинете сверяем со страницей самой дисциплины
const currentCourses = [
  { id: '1', title: 'Разработка веб-приложений' },
  { id: '2', title: 'Нейроинформатика' },
  { id: '3', title: 'Операционные системы' },
  { id: '4', title: 'Базы данных' },
];
const pastCourses = [{ id: '5', title: 'Компьютерные сети' }];

interface LabCount {
  completed: number;
  total: number;
}

// «1 из 3» на карточках и странице дисциплины, «1 / 3» в личном кабинете
function formatCount(count: LabCount, separator: 'из' | '/'): string {
  return `${String(count.completed)} ${separator} ${String(count.total)}`;
}

// считаем по списку работ дисциплины: выполнена — со статусом «Сдано»
async function countCourseLabs(page: Page, id: string): Promise<LabCount> {
  await page.goto(`/courses/${id}`);
  const list = page.getByRole('region', { name: 'Все работы дисциплины' });
  await expect(
    list.or(page.getByText('Лабораторных работ пока нет.')),
  ).toBeVisible();

  const labs = list.getByRole('listitem');
  const total = await labs.count();
  const completed = await labs
    .filter({ has: page.getByText('Сдано', { exact: true }) })
    .count();

  const count = { completed, total };
  if (total > 0) {
    await expect(
      page.getByText(`${formatCount(count, 'из')} выполнено`),
    ).toBeVisible();
  }
  return count;
}

test.describe('число лабораторных совпадает со страницей дисциплины', () => {
  for (const course of [...currentCourses, ...pastCourses]) {
    test(`на карточке «${course.title}»`, async ({ page }) => {
      const count = await countCourseLabs(page, course.id);

      await page.goto('/courses');
      await page.getByRole('button', { name: 'Все семестры' }).click();

      await expect(courseCard(page, course.title)).toContainText(
        `${formatCount(count, 'из')} (`,
      );
    });
  }

  for (const course of currentCourses) {
    test(`в личном кабинете у «${course.title}»`, async ({ page }) => {
      const count = await countCourseLabs(page, course.id);

      await page.goto('/account');

      await expect(
        page.getByRole('main').getByRole('link', { name: course.title }),
      ).toContainText(formatCount(count, '/'));
    });
  }

  test('в прогрессе семестра и «Сдано работ» — сумма по дисциплинам', async ({
    page,
  }) => {
    const sum = { completed: 0, total: 0 };
    for (const course of currentCourses) {
      const count = await countCourseLabs(page, course.id);
      sum.completed += count.completed;
      sum.total += count.total;
    }

    await page.goto('/courses');
    await expect(page.getByRole('main')).toContainText(
      `${formatCount(sum, 'из')} лабораторных выполнены`,
    );

    await page.goto('/account');
    await expect(
      page.getByText('Сдано работ', { exact: true }).locator('..'),
    ).toContainText(formatCount(sum, 'из'));
  });
});
