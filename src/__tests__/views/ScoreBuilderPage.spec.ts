import { beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import ScoreBuilderPage from '@/views/ScoreBuilderPage.vue';
import { getCourseGradebookStub } from '@/api/gradebook/GradebookApi.ts';
import { getTaughtCoursesStub } from '@/api/teaching/TeachingApi.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { courseGradebookFixture, taughtCoursesFixture } from '../fixtures.ts';

vi.mock('@/api/teaching/TeachingApi.ts', () => ({
  getTaughtCoursesStub: vi.fn(),
}));
vi.mock('@/api/gradebook/GradebookApi.ts', () => ({
  getCourseGradebookStub: vi.fn(),
}));

const mockedGetCourses = vi.mocked(getTaughtCoursesStub);
const mockedGetGradebook = vi.mocked(getCourseGradebookStub);

async function mountPage(): Promise<ReturnType<typeof mount>> {
  const wrapper = mount(ScoreBuilderPage);
  await flushPromises();
  return wrapper;
}

async function chooseCourse(
  wrapper: ReturnType<typeof mount>,
  courseId: number,
): Promise<void> {
  await wrapper.find('select').setValue(courseId);
  await flushPromises();
}

function checkedGroups(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper
    .findAll('.group-picker__option')
    .filter(
      (option) => (option.find('input').element as HTMLInputElement).checked,
    )
    .map((option) => option.find('.group-picker__name').text());
}

describe('ScoreBuilderPage', () => {
  beforeEach(() => {
    mockedGetCourses.mockReset();
    mockedGetGradebook.mockReset();
    mockedGetCourses.mockResolvedValue(structuredClone(taughtCoursesFixture));
    // у ведомости id и название выбранной дисциплины
    mockedGetGradebook.mockImplementation((courseId) =>
      Promise.resolve({
        ...structuredClone(courseGradebookFixture),
        courseId,
        courseTitle: `Дисциплина ${String(courseId)}`,
      }),
    );
  });

  it('показывает заголовок страницы', async () => {
    const wrapper = await mountPage();

    expect(wrapper.find('h1').text()).toBe('Конструктор баллов');
  });

  describe('список дисциплин', () => {
    it('пока дисциплины загружаются, показывает статус', () => {
      mockedGetCourses.mockReturnValue(new Promise(() => undefined));
      const wrapper = mount(ScoreBuilderPage);

      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка дисциплин…',
      );
      expect(wrapper.find('select').exists()).toBe(false);
    });

    it('при ошибке показывает её, а «Повторить» загружает снова', async () => {
      mockedGetCourses.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toContain(
        'Не удалось загрузить дисциплины: Сервис временно недоступен',
      );

      await wrapper.find('button[aria-label="Повторить"]').trigger('click');
      await flushPromises();

      expect(mockedGetCourses).toHaveBeenCalledTimes(2);
      expect(wrapper.find('select').exists()).toBe(true);
    });

    it('без дисциплин пишет, что их пока нет', async () => {
      mockedGetCourses.mockResolvedValue([]);
      const wrapper = await mountPage();

      expect(wrapper.text()).toContain('У вас пока нет дисциплин.');
      expect(wrapper.find('select').exists()).toBe(false);
    });
  });

  describe('выбор дисциплины', () => {
    it('дисциплина по умолчанию не выбрана и ничего не загружено', async () => {
      const wrapper = await mountPage();
      const select = wrapper.find('select').element as HTMLSelectElement;

      expect(select.selectedOptions[0]?.text).toBe('Выберите дисциплину');
      expect(wrapper.text()).toContain(
        'Выберите дисциплину — после этого появятся её группы и работы.',
      );
      expect(mockedGetGradebook).not.toHaveBeenCalled();
      expect(wrapper.find('.group-picker').exists()).toBe(false);
    });

    it('у списка подпись «Дисциплина» без текста пунктов', async () => {
      const wrapper = await mountPage();
      const select = wrapper.find('select');
      const label = wrapper.find(
        `label[for="${select.attributes('id') ?? ''}"]`,
      );

      expect(label.text()).toBe('Дисциплина');
      expect(label.find('select').exists()).toBe(false);
    });

    it('в списке — дисциплины преподавателя, подсказку выбрать нельзя', async () => {
      const wrapper = await mountPage();
      const options = wrapper.findAll('option');

      expect(options.map((option) => option.text())).toEqual([
        'Выберите дисциплину',
        'Дисциплина Г',
        'Дисциплина Д',
      ]);
      expect(options[0]?.attributes('disabled')).toBeDefined();
    });

    it('после выбора загружает дисциплину и отмечает все её группы', async () => {
      const wrapper = await mountPage();

      await chooseCourse(wrapper, 31);

      expect(mockedGetGradebook).toHaveBeenCalledWith(31);
      expect(checkedGroups(wrapper)).toEqual(['P0001', 'P0002']);
    });

    it('пока дисциплина загружается, показывает статус', async () => {
      mockedGetGradebook.mockReturnValue(new Promise(() => undefined));
      const wrapper = await mountPage();

      await chooseCourse(wrapper, 31);

      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка дисциплины…',
      );
    });

    it('при ошибке загрузки дисциплины даёт повторить', async () => {
      mockedGetGradebook.mockRejectedValueOnce(
        new ApiRequestError(404, 'Дисциплина не найдена'),
      );
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      expect(wrapper.find('[role="alert"]').text()).toContain(
        'Не удалось загрузить дисциплину: Дисциплина не найдена',
      );

      await wrapper.find('button[aria-label="Повторить"]').trigger('click');
      await flushPromises();

      expect(mockedGetGradebook).toHaveBeenCalledTimes(2);
      expect(checkedGroups(wrapper)).toEqual(['P0001', 'P0002']);
    });
  });

  describe('выбор групп', () => {
    it('снятую группу запоминает, без групп подсказывает отметить', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);
      const checkboxes = wrapper.findAll('.group-picker__checkbox');

      await checkboxes[0]?.setValue(false);
      expect(checkedGroups(wrapper)).toEqual(['P0002']);

      await checkboxes[1]?.setValue(false);
      expect(checkedGroups(wrapper)).toEqual([]);
      expect(wrapper.find('.group-picker__hint').exists()).toBe(true);
    });

    it('при возврате к дисциплине помнит её отметки', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);
      await wrapper.findAll('.group-picker__checkbox')[0]?.setValue(false);

      await chooseCourse(wrapper, 32);
      expect(checkedGroups(wrapper)).toEqual(['P0001', 'P0002']);

      await chooseCourse(wrapper, 31);
      expect(checkedGroups(wrapper)).toEqual(['P0002']);
    });
  });

  describe('работы и разделы БАРС', () => {
    function poolTitles(wrapper: ReturnType<typeof mount>): string[] {
      return wrapper
        .find('.work-pool')
        .findAll('.work-chip__title')
        .map((title) => title.text());
    }

    function sectionScore(
      wrapper: ReturnType<typeof mount>,
      title: string,
    ): string | undefined {
      return wrapper
        .findAll('.bars-section-card')
        .find((card) => card.find('h3').text() === title)
        ?.find('.bars-section-card__score')
        .text();
    }

    function totalText(wrapper: ReturnType<typeof mount>): string {
      return wrapper.find('.score-summary__total').text().replace(/\s+/g, ' ');
    }

    // переносит работу из «Работ курса» через список у чипа
    async function moveFromPool(
      wrapper: ReturnType<typeof mount>,
      workTitle: string,
      target: string,
    ): Promise<void> {
      const chip = wrapper
        .find('.work-pool')
        .findAll('.work-chip')
        .find((item) => item.find('.work-chip__title').text() === workTitle);
      await chip?.find('.work-chip__button').trigger('click');
      await chip
        ?.findAll('[role="menuitem"]')
        .find((item) => item.text() === target)
        ?.trigger('click');
    }

    it('до выбора дисциплины работ и разделов нет', async () => {
      const wrapper = await mountPage();

      expect(wrapper.find('.work-pool').exists()).toBe(false);
      expect(wrapper.find('.bars-section-card').exists()).toBe(false);
    });

    it('после выбора показывает работы курса, пять разделов и итог', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      expect(poolTitles(wrapper)).toEqual(['Работа Б', 'Экзамен']);
      expect(wrapper.findAll('.bars-section-card')).toHaveLength(5);
      expect(sectionScore(wrapper, 'Лабораторные работы')).toBe('15 из 30');
      expect(totalText(wrapper)).toBe('Распределено 15 из 100');
      expect(
        (wrapper.find('.score-summary__input').element as HTMLInputElement)
          .value,
      ).toBe('60');
    });

    it('перенос работы меняет суммы раздела и итог', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await moveFromPool(wrapper, 'Экзамен', 'Экзамен');

      expect(poolTitles(wrapper)).toEqual(['Работа Б']);
      expect(sectionScore(wrapper, 'Экзамен')).toBe('25 из 20');
      expect(totalText(wrapper)).toBe('Распределено 40 из 100');
    });

    it('при возврате к дисциплине помнит раскладку и порог', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);
      await moveFromPool(wrapper, 'Работа Б', 'Работа на занятиях');
      await wrapper.find('.score-summary__input').setValue('55');

      await chooseCourse(wrapper, 32);
      expect(sectionScore(wrapper, 'Работа на занятиях')).toBe('0 из 20');

      await chooseCourse(wrapper, 31);
      expect(sectionScore(wrapper, 'Работа на занятиях')).toBe('10 из 20');
      expect(
        (wrapper.find('.score-summary__input').element as HTMLInputElement)
          .value,
      ).toBe('55');
    });
  });

  describe('редактирование работ', () => {
    function poolTitles(wrapper: ReturnType<typeof mount>): string[] {
      return wrapper
        .find('.work-pool')
        .findAll('.work-chip__title')
        .map((title) => title.text());
    }

    function totalText(wrapper: ReturnType<typeof mount>): string {
      return wrapper.find('.score-summary__total').text().replace(/\s+/g, ' ');
    }

    async function chooseAction(
      wrapper: ReturnType<typeof mount>,
      workTitle: string,
      action: string,
    ): Promise<void> {
      const chip = wrapper
        .findAll('.work-chip')
        .find((item) => item.find('.work-chip__title').text() === workTitle);
      await chip?.find('.work-chip__button').trigger('click');
      await chip
        ?.findAll('[role="menuitem"]')
        .find((item) => item.text() === action)
        ?.trigger('click');
      await flushPromises();
    }

    async function addWork(
      wrapper: ReturnType<typeof mount>,
      title: string,
      score: string,
    ): Promise<void> {
      await wrapper.find('.work-pool__add').trigger('click');
      await wrapper.find('.add-work-form input[type="text"]').setValue(title);
      await wrapper.find('.add-work-form input[type="number"]').setValue(score);
      await wrapper.find('.add-work-form').trigger('submit');
      await flushPromises();
    }

    it('новая работа появляется в «Работах курса»', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await addWork(wrapper, 'ЛР6', '10');

      expect(poolTitles(wrapper)).toEqual(['Работа Б', 'Экзамен', 'ЛР6']);
    });

    it('работу с уже занятым названием не добавляет', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      // «Работа А» лежит в разделе, а не в «Работах курса»
      await addWork(wrapper, 'работа а', '10');

      expect(wrapper.find('.add-work-form__error').text()).toBe(
        'Работа с таким названием уже есть',
      );
      expect(poolTitles(wrapper)).toEqual(['Работа Б', 'Экзамен']);
    });

    it('новые баллы работы меняют итог', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await chooseAction(wrapper, 'Работа А', 'Изменить баллы');
      await wrapper.find('.work-score-form__input').setValue('20');
      await wrapper.find('.work-score-form').trigger('submit');
      await flushPromises();

      expect(totalText(wrapper)).toBe('Распределено 20 из 100');
    });

    it('удалённая работа пропадает из раздела и итога', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await chooseAction(wrapper, 'Работа А', 'Удалить работу');

      expect(
        wrapper.findAll('.work-chip__title').map((title) => title.text()),
      ).not.toContain('Работа А');
      expect(totalText(wrapper)).toBe('Распределено 0 из 100');
    });
  });

  describe('предпросмотр ведомости', () => {
    function workHeaders(wrapper: ReturnType<typeof mount>): string[] {
      return wrapper
        .findAll('.gradebook-preview__head--work')
        .map((cell) => cell.text().replace(/\s+/g, ' '));
    }

    it('показывает вкладки отмеченных групп и разложенные работы', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
        'P0001',
        'P0002',
      ]);
      expect(workHeaders(wrapper)).toEqual(['Работа А из 15']);
    });

    it('перенесённая в раздел работа становится колонкой', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      const chip = wrapper
        .find('.work-pool')
        .findAll('.work-chip')
        .find((item) => item.find('.work-chip__title').text() === 'Экзамен');
      await chip?.find('.work-chip__button').trigger('click');
      await chip
        ?.findAll('[role="menuitem"]')
        .find((item) => item.text() === 'Экзамен')
        ?.trigger('click');

      expect(workHeaders(wrapper)).toEqual(['Работа А из 15', 'Экзамен из 25']);
    });

    it('снятая группа пропадает из вкладок', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await wrapper.findAll('.group-picker__checkbox')[0]?.setValue(false);

      expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
        'P0002',
      ]);
    });

    it('порог допуска из поля попадает в шапку', async () => {
      const wrapper = await mountPage();
      await chooseCourse(wrapper, 31);

      await wrapper.find('.score-summary__input').setValue('55');

      expect(wrapper.find('.gradebook-preview thead').text()).toContain(
        'от 55 баллов',
      );
    });
  });
});
