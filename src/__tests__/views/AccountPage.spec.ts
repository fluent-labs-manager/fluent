import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Router } from 'vue-router';
import AccountPage from '@/views/AccountPage.vue';
import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import {
  semestersFixture,
  studentFixture,
  studentProfileFixture,
  teacherFixture,
  teacherProfileFixture,
} from '../fixtures.ts';

vi.mock('@/api/account/AccountApi.ts', () => ({
  getAccountProfileStub: vi.fn(),
}));
vi.mock('@/api/semesters/SemestersApi.ts', () => ({
  getSemestersStub: vi.fn(),
}));
vi.mock('@/api/users/UsersApi.ts', () => ({ getCurrentUserStub: vi.fn() }));

const mockedGetProfile = vi.mocked(getAccountProfileStub);
const mockedGetSemesters = vi.mocked(getSemestersStub);
const mockedGetCurrentUser = vi.mocked(getCurrentUserStub);

const Stub = { template: '<div />' };

function createTestRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      { path: '/courses', name: 'courses', component: Stub },
      { path: '/courses/:courseId', name: 'course-labs', component: Stub },
      { path: '/account', name: 'account', component: Stub },
    ],
  });
}

async function mountPage(
  router: Router = createTestRouter(),
): Promise<ReturnType<typeof mount>> {
  await router.push('/account');
  await router.isReady();

  const wrapper = mount(AccountPage, {
    global: {
      plugins: [createPinia(), router],
    },
  });
  await flushPromises();

  return wrapper;
}

function statsOf(wrapper: ReturnType<typeof mount>): string[][] {
  return wrapper
    .findAll('.account-page__stat')
    .map((stat) =>
      [
        '.account-page__stat-label',
        '.account-page__stat-value',
        '.account-page__stat-hint',
      ].map((part) => stat.find(part).text()),
    );
}

function useStudent(): void {
  mockedGetCurrentUser.mockResolvedValue(structuredClone(studentFixture));
  mockedGetProfile.mockResolvedValue(structuredClone(studentProfileFixture));
}

function useTeacher(): void {
  mockedGetCurrentUser.mockResolvedValue(structuredClone(teacherFixture));
  mockedGetProfile.mockResolvedValue(structuredClone(teacherProfileFixture));
}

describe('AccountPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetSemesters.mockResolvedValue(structuredClone(semestersFixture));
  });

  // студент
  describe('студент', () => {
    beforeEach(useStudent);

    it('показывает шапку профиля с инициалами, именем и группой', async () => {
      const wrapper = await mountPage();

      expect(wrapper.find('h1').text()).toBe('Личный кабинет');
      expect(wrapper.find('.account-page__avatar').text()).toBe('ТС');
      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Студент',
      );
      expect(wrapper.find('.account-page__role').text()).toBe(
        'Студент · P0000',
      );
    });

    it('показывает почту, направление, курс и поток без подписей', async () => {
      const wrapper = await mountPage();
      const details = wrapper.find('.account-page__details').text();

      expect(details).toContain('student@test.ru');
      expect(details).toContain('Тестовое направление');
      expect(details).toContain('2 курс · 2025/26');
      expect(details).not.toContain('Корпоративная почта');
      expect(details).not.toContain('Направление');
      expect(details).not.toContain('Курс и поток');
    });

    it('показывает дисциплины текущего семестра со ссылками на их работы', async () => {
      const wrapper = await mountPage();
      const links = wrapper.findAll('.account-page__course--link');

      expect(wrapper.text()).toContain('Текущие дисциплины');
      expect(links.map((link) => link.attributes('aria-label'))).toEqual([
        'Курс А',
        'Курс Б',
      ]);
      expect(links[0]?.attributes('href')).toBe('/courses/11');
      expect(links[0]?.text()).toContain('1 / 3');
    });

    it('показывает сводку по лабораторным и средний балл семестра', async () => {
      const wrapper = await mountPage();

      expect(statsOf(wrapper)).toEqual([
        ['Сдано работ', '3 из 5', '60% общего плана'],
        ['Средний балл', '4,50 / 5', 'за текущий семестр'],
      ]);
    });

    it('не показывает ссылку «Все дисциплины»', async () => {
      const wrapper = await mountPage();

      expect(wrapper.text()).not.toContain('Все дисциплины');
    });

    it('не показывает блоки преподавателя', async () => {
      const wrapper = await mountPage();
      const text = wrapper.text();

      expect(text).not.toContain('Кафедра');
      expect(text).not.toContain('Должность');
      expect(text).not.toContain('Мои дисциплины');
      expect(text).not.toContain('Ждут проверки');
    });

    it('запрашивает профиль студента', async () => {
      await mountPage();

      expect(mockedGetProfile).toHaveBeenCalledWith('student');
    });

    it('без дисциплин в текущем семестре показывает «Дисциплин пока нет»', async () => {
      mockedGetSemesters.mockResolvedValue([]);
      const wrapper = await mountPage();

      expect(wrapper.find('.account-page__empty').text()).toBe(
        'Дисциплин пока нет.',
      );
      expect(wrapper.text()).not.toContain('Средний балл');
    });
  });

  // преподаватель
  describe('преподаватель', () => {
    beforeEach(useTeacher);

    it('показывает шапку профиля с ролью вместо группы', async () => {
      const wrapper = await mountPage();

      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Преподаватель',
      );
      expect(wrapper.find('.account-page__role').text()).toBe('Преподаватель');
    });

    it('показывает почту, кафедру и должность без подписей', async () => {
      const wrapper = await mountPage();
      const details = wrapper.find('.account-page__details').text();

      expect(details).toContain('teacher@test.ru');
      expect(details).toContain('Тестовая кафедра');
      expect(details).toContain('Доцент');
      expect(details).not.toContain('Корпоративная почта');
      expect(details).not.toContain('Кафедра');
      expect(details).not.toContain('Должность');
    });

    it('показывает ведомые дисциплины с группами и работами на проверке', async () => {
      const wrapper = await mountPage();
      const courses = wrapper
        .findAll('.account-page__course')
        .map((course) => [
          course.find('.account-page__course-title').text(),
          course.find('.account-page__course-meta').text(),
          course.find('.account-page__course-value').text(),
        ]);

      expect(wrapper.text()).toContain('Мои дисциплины');
      expect(courses).toEqual([
        ['Дисциплина Г', 'Группы: P1111, P1112', '4'],
        ['Дисциплина Д', 'Группы: P1111', '0'],
      ]);
      // у преподавателя строки дисциплин не ссылки: его страницы дисциплины ещё нет
      expect(wrapper.find('.account-page__course--link').exists()).toBe(false);
    });

    it('суммирует работы на проверке, дисциплины и группы', async () => {
      const wrapper = await mountPage();

      expect(statsOf(wrapper)).toEqual([
        ['Ждут проверки', '4', 'работ без оценки'],
        ['Дисциплин', '2', 'групп: 2'],
      ]);
    });

    it('не показывает блоки студента', async () => {
      const wrapper = await mountPage();
      const text = wrapper.text();

      expect(text).not.toContain('Текущие дисциплины');
      expect(text).not.toContain('Все дисциплины');
      expect(text).not.toContain('Направление');
      expect(text).not.toContain('Курс и поток');
      expect(text).not.toContain('Сдано работ');
      expect(text).not.toContain('Средний балл');
    });

    it('запрашивает профиль преподавателя', async () => {
      await mountPage();

      expect(mockedGetProfile).toHaveBeenCalledWith('teacher');
    });

    it('не запрашивает семестры — они нужны только студенту', async () => {
      await mountPage();

      expect(mockedGetSemesters).not.toHaveBeenCalled();
    });

    it('без дисциплин показывает «Дисциплин пока нет»', async () => {
      mockedGetProfile.mockResolvedValue({
        ...structuredClone(teacherProfileFixture),
        courses: [],
      });
      const wrapper = await mountPage();

      expect(wrapper.find('.account-page__empty').text()).toBe(
        'Дисциплин пока нет.',
      );
    });
  });

  // загрузка и ошибки
  describe('состояния загрузки', () => {
    beforeEach(useStudent);

    it('пока данные загружаются, показывает сообщение о загрузке', async () => {
      mockedGetProfile.mockReturnValue(new Promise(() => undefined));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="status"]').text()).toBe('Загрузка профиля…');
      expect(wrapper.find('.account-page__profile').exists()).toBe(false);
    });

    it('при ошибке профиля показывает её текст целиком', async () => {
      mockedGetProfile.mockRejectedValue(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить профиль: Сервис временно недоступен',
      );
    });

    it('для ошибки не из ApiResolver показывает «Неизвестная ошибка» без повтора подписи', async () => {
      mockedGetProfile.mockRejectedValue(new Error('boom'));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить профиль: Неизвестная ошибка',
      );
    });

    it('показывает ошибку, если не удалось загрузить пользователя', async () => {
      mockedGetCurrentUser.mockRejectedValue(
        new ApiRequestError(500, 'Ошибка сервера'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить профиль: Ошибка сервера',
      );
    });

    it('у студента показывает ошибку загрузки дисциплин', async () => {
      mockedGetSemesters.mockRejectedValue(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить профиль: Сервис временно недоступен',
      );
    });

    it('после «Повторить» загружает данные заново', async () => {
      mockedGetProfile.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.account-page__retry').trigger('click');
      await flushPromises();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Студент',
      );
    });
  });

  // кнопки
  describe('кнопки', () => {
    beforeEach(useStudent);

    afterEach(() => {
      window.history.replaceState(null, '', '/');
    });

    it('«Редактировать» и «Настройки» пока недоступны', async () => {
      const wrapper = await mountPage();
      const actions = wrapper.findAll('.account-page__action');

      expect(actions.map((action) => action.text())).toEqual([
        'Редактировать',
        'Настройки',
      ]);
      expect(
        actions.every((action) => action.attributes('disabled') !== undefined),
      ).toBe(true);
    });

    it('«Назад» возвращает на предыдущую страницу приложения', async () => {
      const router = createTestRouter();
      const back = vi.spyOn(router, 'back').mockImplementation(() => undefined);
      const wrapper = await mountPage(router);
      window.history.replaceState({ back: '/courses' }, '', '/account');

      await wrapper.find('.account-page__back').trigger('click');

      expect(back).toHaveBeenCalledOnce();
    });

    it('«Назад» без истории внутри приложения ведёт на главную', async () => {
      const router = createTestRouter();
      const wrapper = await mountPage(router);
      window.history.replaceState(null, '', '/account');

      await wrapper.find('.account-page__back').trigger('click');
      await flushPromises();

      expect(router.currentRoute.value.name).toBe('home');
    });
  });
});
