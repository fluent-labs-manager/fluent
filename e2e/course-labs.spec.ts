import { test, expect } from '@playwright/test';

test.describe('страница лабораторных курса по прямой ссылке', () => {
  test('открывает /courses/1 без перехода со страницы дисциплин', async ({
    page,
  }) => {
    await page.goto('/courses/1');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
    await expect(page.getByText('1 из 3 выполнено')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Активная работа' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Все работы дисциплины' })
        .getByRole('listitem'),
    ).toHaveCount(3);
  });

  test('после перезагрузки страницы показывает тот же курс', async ({
    page,
  }) => {
    await page.goto('/courses/1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );

    await page.reload();

    await expect(page).toHaveURL('/courses/1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Разработка веб-приложений',
    );
  });
});

test.describe('несуществующий курс', () => {
  for (const courseId of ['999', 'abc']) {
    test(`по адресу /courses/${courseId} показывает «Дисциплина не найдена» и даёт вернуться к дисциплинам`, async ({
      page,
    }) => {
      await page.goto(`/courses/${courseId}`);

      await expect(page.getByRole('alert')).toHaveText(
        'Не удалось загрузить лабораторные работы: Дисциплина не найдена',
      );
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);

      await page.getByRole('link', { name: 'К дисциплинам' }).click();
      await expect(page).toHaveURL('/courses');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Дисциплины',
      );
    });
  }
});
