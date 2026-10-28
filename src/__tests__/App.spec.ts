import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import App from '../App.vue';
import router from '@/router/index.ts';
import { getAccountProfileStub } from '@/api/account/AccountApi.ts';
import { getSemestersStub } from '@/api/semesters/SemestersApi.ts';
import { getCurrentUserStub } from '@/api/users/UsersApi.ts';
import {
  semestersFixture,
  studentFixture,
  studentProfileFixture,
  teacherFixture,
  teacherProfileFixture,
} from './fixtures.ts';

vi.mock('@/api/account/AccountApi.ts', () => ({
  getAccountProfileStub: vi.fn(),
}));

vi.mock('@/api/semesters/SemestersApi.ts', () => ({
  getSemestersStub: vi.fn(),
}));
vi.mock('@/api/users/UsersApi.ts', () => ({ getCurrentUserStub: vi.fn() }));

// роутер общий для всех тестов, поэтому приложение из прошлого теста нужно
// размонтировать: иначе его раскладка продолжит реагировать на переходы
const mounted: ReturnType<typeof mount>[] = [];

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => {
    wrapper.unmount();
  });
});

async function mountAt(path: string): Promise<ReturnType<typeof mount>> {
  // как в main.ts: Pinia подключена до первой навигации — её использует
  // проверка доступа в роутере
  const pinia = createPinia();
  setActivePinia(pinia);
  await router.push(path);
  await router.isReady();
  const wrapper = mount(App, {
    global: {
      plugins: [router, pinia],
    },
  });
  mounted.push(wrapper);
  await flushPromises();
  return wrapper;
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getSemestersStub).mockResolvedValue(
      structuredClone(semestersFixture),
    );
    vi.mocked(getCurrentUserStub).mockResolvedValue(
      structuredClone(studentFixture),
    );
    vi.mocked(getAccountProfileStub).mockResolvedValue(
      structuredClone(studentProfileFixture),
    );
  });

  it('на корневом адресе отображает главную страницу с боковым меню', async () => {
    const wrapper = await mountAt('/');
    expect(wrapper.find('.app-sidebar').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Главная');
    expect(wrapper.find('.app-sidebar__user-name').text()).toBe(
      studentFixture.name,
    );
  });

  it('по адресу /courses отображает страницу дисциплин', async () => {
    const wrapper = await mountAt('/courses');
    expect(wrapper.find('h1').text()).toBe('Дисциплины');
    expect(wrapper.findAll('.course-card').length).toBeGreaterThan(0);
  });

  it('подсвечивает в меню только текущий раздел', async () => {
    const wrapper = await mountAt('/courses');
    const activeLinks = wrapper.findAll('.app-sidebar__link--active');
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]?.text()).toBe('Дисциплины');
  });

  it('ведёт на главную из пункта меню «Главная»', async () => {
    const wrapper = await mountAt('/courses');
    const homeLink = wrapper
      .findAll('.app-sidebar__link')
      .find((link) => link.text() === 'Главная');
    expect(homeLink?.attributes('href')).toBe('/');
  });

  it('ведёт в личный кабинет с карточки пользователя в меню', async () => {
    const wrapper = await mountAt('/courses');
    expect(wrapper.find('.app-sidebar__user').attributes('href')).toBe(
      '/account',
    );
  });

  it('по адресу /account открывает личный кабинет и отмечает карточку пользователя', async () => {
    const wrapper = await mountAt('/account');
    expect(wrapper.find('h1').text()).toBe('Личный кабинет');
    expect(wrapper.find('.app-sidebar__user').classes()).toContain(
      'app-sidebar__user--active',
    );
  });

  // меню зависит от роли
  describe('меню по роли', () => {
    function menuOf(wrapper: ReturnType<typeof mount>): {
      links: string[];
      inactive: string[];
    } {
      const items = wrapper.findAll('.app-sidebar__link');
      return {
        links: items
          .filter((item) => item.element.tagName === 'A')
          .map((item) => item.text()),
        inactive: items
          .filter((item) => item.attributes('aria-disabled') === 'true')
          .map((item) => item.text()),
      };
    }

    it('студенту показывает его разделы со ссылкой на дисциплины', async () => {
      const wrapper = await mountAt('/');

      expect(menuOf(wrapper)).toEqual({
        links: ['Главная', 'Дисциплины'],
        inactive: ['События'],
      });
    });

    it('преподавателю показывает его разделы без страницы дисциплин', async () => {
      vi.mocked(getCurrentUserStub).mockResolvedValue(
        structuredClone(teacherFixture),
      );
      vi.mocked(getAccountProfileStub).mockResolvedValue(
        structuredClone(teacherProfileFixture),
      );
      const wrapper = await mountAt('/');

      expect(menuOf(wrapper)).toEqual({
        links: ['Главная', 'Очереди', 'Оценивание'],
        inactive: ['Варианты', 'ИИ-предфильтр', 'Конструктор баллов'],
      });
      expect(wrapper.find('.app-sidebar__user-group').text()).toBe(
        'Преподаватель',
      );
    });

    it('пока роль неизвестна, показывает только «Главную»', async () => {
      vi.mocked(getCurrentUserStub).mockReturnValue(
        new Promise(() => undefined),
      );
      const wrapper = await mountAt('/');

      expect(menuOf(wrapper)).toEqual({ links: ['Главная'], inactive: [] });
    });
  });

  // дисциплины доступны только студенту
  describe('доступ к дисциплинам', () => {
    function useTeacher(): void {
      vi.mocked(getCurrentUserStub).mockResolvedValue(
        structuredClone(teacherFixture),
      );
      vi.mocked(getAccountProfileStub).mockResolvedValue(
        structuredClone(teacherProfileFixture),
      );
    }

    it('преподавателя по прямой ссылке на /courses уводит на главную', async () => {
      useTeacher();
      const wrapper = await mountAt('/courses');

      expect(router.currentRoute.value.name).toBe('home');
      expect(wrapper.find('h1').text()).toBe('Главная');
    });

    it('преподавателя по прямой ссылке на страницу дисциплины уводит на главную', async () => {
      useTeacher();
      await mountAt('/courses/11');

      expect(router.currentRoute.value.name).toBe('home');
    });

    it('не пускает преподавателя к дисциплинам при переходе внутри приложения', async () => {
      useTeacher();
      await mountAt('/account');
      vi.mocked(getSemestersStub).mockClear();

      await router.push('/courses');
      await flushPromises();

      expect(router.currentRoute.value.name).toBe('home');
      // проверка в роутере не даёт странице даже открыться и запросить данные
      expect(getSemestersStub).not.toHaveBeenCalled();
    });

    it('студенту дисциплины доступны', async () => {
      const wrapper = await mountAt('/courses');

      expect(router.currentRoute.value.name).toBe('courses');
      expect(wrapper.find('h1').text()).toBe('Дисциплины');
    });
  });
});
