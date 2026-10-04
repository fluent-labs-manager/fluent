import { beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import YourCoursesPage from '@/views/YourCoursesPage.vue';
import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { semestersFixture, studentFixture } from '../fixtures.ts';

vi.mock('@/api/semesters/SemestersApi.ts', () => ({
  getSemestersStub: vi.fn(),
}));
vi.mock('@/api/users/UsersApi.ts', () => ({ getCurrentUserStub: vi.fn() }));

const mockedGetSemesters = vi.mocked(getSemestersStub);
const mockedGetCurrentUser = vi.mocked(getCurrentUserStub);

async function mountPage(): Promise<ReturnType<typeof mount>> {
  const wrapper = mount(YourCoursesPage, {
    global: {
      plugins: [createPinia()],
    },
  });
  await flushPromises();

  return wrapper;
}

describe('YourCoursesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetSemesters.mockResolvedValue(structuredClone(semestersFixture));
    mockedGetCurrentUser.mockResolvedValue(structuredClone(studentFixture));
  });

  // загрузка, ошибка, пустой список
  describe('состояния загрузки', () => {
    it('пока данные загружаются, показывает сообщение о загрузке', async () => {
      mockedGetSemesters.mockReturnValue(new Promise(() => undefined));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка дисциплин…',
      );
      expect(wrapper.find('.course-card').exists()).toBe(false);
      expect(wrapper.find('.courses-page__filters').exists()).toBe(false);
    });

    it('при ошибке показывает её текст и кнопку «Повторить»', async () => {
      mockedGetSemesters.mockRejectedValue(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Сервис временно недоступен',
      );
      expect(
        wrapper.find('.courses-page__retry').attributes('aria-label'),
      ).toBe('Повторить');
      expect(wrapper.find('.course-card').exists()).toBe(false);
    });

    it('после «Повторить» загружает данные заново', async () => {
      mockedGetSemesters.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.courses-page__retry').trigger('click');
      await flushPromises();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.findAll('.course-card')).toHaveLength(2);
    });

    // «Не удалось загрузить дисциплины: Не удалось загрузить дисциплины» проходил.
    it('для ошибки не из ApiResolver показывает подпись и «Неизвестная ошибка» без повтора', async () => {
      mockedGetSemesters.mockRejectedValue(new Error('boom'));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Неизвестная ошибка',
      );
    });

    it('показывает ошибку, если не удалось загрузить пользователя', async () => {
      mockedGetCurrentUser.mockRejectedValue(
        new ApiRequestError(500, 'Ошибка сервера'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Ошибка сервера',
      );
    });

    it('для ошибки пользователя не из ApiResolver показывает «Неизвестная ошибка» без повтора', async () => {
      mockedGetCurrentUser.mockRejectedValue(new Error('boom'));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Неизвестная ошибка',
      );
    });

    it('при пустом списке показывает «Дисциплин пока нет» без сводки', async () => {
      mockedGetSemesters.mockResolvedValue([]);
      const wrapper = await mountPage();

      expect(wrapper.find('.courses-page__empty').text()).toBe(
        'Дисциплин пока нет.',
      );
      expect(wrapper.find('.semester-progress').exists()).toBe(false);
    });
  });

  // загруженные данные
  describe('загруженные данные', () => {
    it('отображает заголовок страницы', async () => {
      const wrapper = await mountPage();
      expect(wrapper.find('h1').text()).toBe('Дисциплины');
    });

    it('показывает карточки курсов текущего семестра', async () => {
      const wrapper = await mountPage();
      const titles = wrapper
        .findAll('.course-card__title')
        .map((title) => title.text());
      expect(titles).toEqual(['Курс А', 'Курс Б']);
    });

    it('подписывает кнопку текущего семестра его названием', async () => {
      const wrapper = await mountPage();
      expect(wrapper.findAll('.courses-page__filter')[0]?.text()).toBe(
        'Осень 2026',
      );
    });

    it('показывает прогресс семестра перед карточками курсов', async () => {
      const wrapper = await mountPage();
      const html = wrapper.html();
      expect(html.indexOf('semester-progress')).toBeLessThan(
        html.indexOf('course-card'),
      );
    });

    it('показывает сводку по текущему семестру', async () => {
      const wrapper = await mountPage();
      const summary = wrapper.find('.semester-progress').text();
      expect(summary).toContain('3 из 5 лабораторных выполнены');
      expect(summary).toContain('средний балл 4,50');
      expect(summary).toContain('60%');
    });

    it('отмечает выбранный семестр через aria-pressed', async () => {
      const wrapper = await mountPage();
      const buttons = wrapper.findAll('.courses-page__filter');
      expect(buttons[0]?.attributes('aria-pressed')).toBe('true');
      expect(buttons[1]?.attributes('aria-pressed')).toBe('false');

      await buttons[1]?.trigger('click');
      expect(buttons[0]?.attributes('aria-pressed')).toBe('false');
      expect(buttons[1]?.attributes('aria-pressed')).toBe('true');
    });

    it('во вкладке «Все семестры» показывает курсы всех семестров без сводки', async () => {
      const wrapper = await mountPage();
      await wrapper.findAll('.courses-page__filter')[1]?.trigger('click');

      expect(wrapper.findAll('.course-card')).toHaveLength(3);
      expect(wrapper.find('.semester-progress').exists()).toBe(false);
    });
  });
});
