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

// работа в карточке зависит от сроков, поэтому дата зафиксирована: 2 октября
test.describe('выбор работы в карточке', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-02T12:00:00+03:00'));
  });

  test('по нажатию на работу в списке открывает её в карточке и запоминает выбор после перезагрузки', async ({
    page,
  }) => {
    const cardTitle = page
      .getByRole('region', { name: 'Активная работа' })
      .getByRole('heading', { level: 3 });

    await page.goto('/courses/2');
    await expect(cardTitle).toHaveText('Обучение многослойного перцептрона');

    await page.getByRole('button', { name: 'Лаб №4: Свёрточные сети' }).click();

    await expect(cardTitle).toHaveText('Свёрточные сети');
    await expect(page).toHaveURL('/courses/2?lab=204');

    await page.reload();

    await expect(cardTitle).toHaveText('Свёрточные сети');
  });

  test('недоступную работу выбрать нельзя', async ({ page }) => {
    await page.goto('/courses/1');

    const allLabs = page.getByRole('region', { name: 'Все работы дисциплины' });
    await expect(allLabs.getByText('Лаб №3: Интеграция API')).toBeVisible();
    await expect(
      allLabs.getByRole('button', { name: 'Лаб №3: Интеграция API' }),
    ).toHaveCount(0);
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
