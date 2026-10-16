import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Router } from 'vue-router';
import AccountPage from '@/views/AccountPage.vue';
import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import { getTaughtCoursesStub } from '@/api/teaching/TeachingApi.ts';
import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import { useUserStore } from '@/stores/user.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import {
  semestersFixture,
  studentFixture,
  studentProfileFixture,
  taughtCoursesFixture,
  teacherFixture,
  teacherProfileFixture,
} from '../fixtures.ts';

vi.mock('@/api/account/AccountApi.ts', () => ({
  getAccountProfileStub: vi.fn(),
}));
vi.mock('@/api/semesters/SemestersApi.ts', () => ({
  getSemestersStub: vi.fn(),
}));
vi.mock('@/api/teaching/TeachingApi.ts', () => ({
  getTaughtCoursesStub: vi.fn(),
}));
vi.mock('@/api/users/UsersApi.ts', () => ({ getCurrentUserStub: vi.fn() }));

const mockedGetProfile = vi.mocked(getAccountProfileStub);
const mockedGetSemesters = vi.mocked(getSemestersStub);
const mockedGetTaughtCourses = vi.mocked(getTaughtCoursesStub);
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

  // пользователя загружает MainLayout, страница только читает его из стора
  const pinia = createPinia();
  void useUserStore(pinia).loadUser();

  const wrapper = mount(AccountPage, {
    global: {
      plugins: [pinia, router],
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
    mockedGetTaughtCourses.mockResolvedValue(
      structuredClone(taughtCoursesFixture),
    );
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
      expect(
        links.map((link) => link.find('.account-page__course-title').text()),
      ).toEqual(['Курс А', 'Курс Б']);
      // без aria-label: скринридер читает и преподавателя, и прогресс
      expect(links[0]?.attributes('aria-label')).toBeUndefined();
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

    it('без оценок в семестре показывает прочерк вместо среднего балла', async () => {
      mockedGetSemesters.mockResolvedValue(
        structuredClone(semestersFixture).map((semester) =>
          semester.isCurrent ? { ...semester, averageGrade: null } : semester,
        ),
      );
      const wrapper = await mountPage();

      expect(statsOf(wrapper)[1]).toEqual([
        'Средний балл',
        '—',
        'оценок пока нет',
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

    it('не запрашивает дисциплины преподавателя', async () => {
      await mountPage();

      expect(mockedGetTaughtCourses).not.toHaveBeenCalled();
    });

    it('без дисциплин в текущем семестре показывает «Дисциплин пока нет»', async () => {
      mockedGetSemesters.mockResolvedValue([]);
      const wrapper = await mountPage();

      expect(wrapper.find('.account-page__empty').text()).toBe(
        'Дисциплин пока нет.',
      );
      expect(statsOf(wrapper)).toEqual([
        ['Сдано работ', '—', 'работ пока нет'],
      ]);
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
      expect(
        wrapper
          .findAll('.account-page__detail')
          .map((detail) => detail.attributes('title')),
      ).toEqual(['Корпоративная почта', 'Подразделение', 'Должность']);
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

    it('не запрашивает семестры — они нужны только студенту', async () => {
      await mountPage();

      expect(mockedGetSemesters).not.toHaveBeenCalled();
    });

    it('показывает ошибку загрузки дисциплин и после «Повторить» грузит их заново', async () => {
      mockedGetTaughtCourses.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Сервис временно недоступен',
      );

      await wrapper.find('.account-page__retry').trigger('click');
      await flushPromises();

      expect(mockedGetTaughtCourses).toHaveBeenCalledTimes(2);
      expect(wrapper.text()).toContain('Дисциплина Г');
    });

    it('без дисциплин показывает «Дисциплин пока нет»', async () => {
      mockedGetTaughtCourses.mockResolvedValue([]);
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
        'Не удалось загрузить данные: Сервис временно недоступен',
      );
    });

    it('для ошибки не из ApiResolver показывает «Неизвестная ошибка» без повтора подписи', async () => {
      mockedGetProfile.mockRejectedValue(new Error('boom'));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить данные: Неизвестная ошибка',
      );
    });

    it('показывает ошибку, если не удалось загрузить пользователя', async () => {
      mockedGetCurrentUser.mockRejectedValue(
        new ApiRequestError(500, 'Ошибка сервера'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить данные: Ошибка сервера',
      );
    });

    it('при ошибке дисциплин оставляет профиль и показывает ошибку в их колонке', async () => {
      mockedGetSemesters.mockRejectedValue(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить дисциплины: Сервис временно недоступен',
      );
      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Студент',
      );
      expect(wrapper.find('h2#account-courses-heading').text()).toBe(
        'Текущие дисциплины',
      );
      // сводка считается из дисциплин — без них её не показываем
      expect(wrapper.find('.account-page__stats').exists()).toBe(false);
    });

    it('пока дисциплины загружаются, профиль уже виден', async () => {
      mockedGetSemesters.mockReturnValue(new Promise(() => undefined));
      const wrapper = await mountPage();

      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Студент',
      );
      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка дисциплин…',
      );
      expect(wrapper.find('.account-page__stats').exists()).toBe(false);
    });

    it('если роль профиля не совпала с ролью пользователя, показывает ошибку, а не чужую разметку', async () => {
      mockedGetProfile.mockResolvedValue(
        structuredClone(teacherProfileFixture),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Не удалось загрузить данные: Профиль не совпадает с ролью пользователя',
      );
      expect(wrapper.find('.account-page__profile').exists()).toBe(false);
    });

    it('«Повторить» загружает заново только то, что не загрузилось', async () => {
      mockedGetSemesters.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.account-page__retry').trigger('click');
      await flushPromises();

      expect(mockedGetSemesters).toHaveBeenCalledTimes(2);
      expect(mockedGetProfile).toHaveBeenCalledTimes(1);
      expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain('Курс А');
    });

    it('после ошибки пользователя «Повторить» загружает его и данные страницы', async () => {
      mockedGetCurrentUser.mockRejectedValueOnce(
        new ApiRequestError(500, 'Ошибка сервера'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.account-page__retry').trigger('click');
      await flushPromises();

      expect(mockedGetCurrentUser).toHaveBeenCalledTimes(2);
      expect(mockedGetSemesters).toHaveBeenCalledTimes(1);
      expect(wrapper.find('.account-page__name').text()).toBe(
        'Тестовый Студент',
      );
    });

    it('если не загрузились и профиль, и дисциплины, общий «Повторить» грузит оба', async () => {
      mockedGetProfile.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      mockedGetSemesters.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.account-page__retry').trigger('click');
      await flushPromises();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.text()).toContain('Курс А');
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
