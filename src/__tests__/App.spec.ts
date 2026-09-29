import { describe, it, expect } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import App from '../App.vue';
import router from '@/router/index.ts';

async function mountAt(path: string): Promise<ReturnType<typeof mount>> {
  await router.push(path);
  await router.isReady();
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  await flushPromises();
  return wrapper;
}

describe('App', () => {
  it('на корневом адресе отображает главную страницу с боковым меню', async () => {
    const wrapper = await mountAt('/');
    expect(wrapper.find('.app-sidebar').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Главная');
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
