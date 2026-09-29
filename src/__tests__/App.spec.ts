import { beforeEach, describe, it, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import App from '../App.vue';
import router from '@/router/index.ts';
import { getSemestersStub } from '@/api/semesters.ts';
import { getCurrentUserStub } from '@/api/user.ts';
import { semestersFixture, studentFixture } from './fixtures.ts';

vi.mock('@/api/semesters.ts', () => ({ getSemestersStub: vi.fn() }));
vi.mock('@/api/user.ts', () => ({ getCurrentUserStub: vi.fn() }));

async function mountAt(path: string): Promise<ReturnType<typeof mount>> {
  await router.push(path);
  await router.isReady();
  const wrapper = mount(App, {
    global: {
      plugins: [router, createPinia()],
    },
  });
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
});
