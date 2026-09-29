import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import YourCoursesPage from '@/views/YourCoursesPage.vue';

describe('YourCoursesPage', () => {
  it('отображает заголовок страницы', () => {
    const wrapper = mount(YourCoursesPage);
    expect(wrapper.find('h1').text()).toBe('Дисциплины');
  });

  it('отображает карточку на каждый курс с его прогрессом', () => {
    const wrapper = mount(YourCoursesPage);
    expect(wrapper.findAll('.course-card')).toHaveLength(3);
    expect(wrapper.text()).toContain('Разработка веб-приложений');
    expect(wrapper.text()).toContain('Михайлюк Степан');
    expect(wrapper.text()).toContain('4 из 6 (66,7%)');
  });

  it('показывает ближайший дедлайн или его отсутствие', () => {
    const wrapper = mount(YourCoursesPage);
    const deadlines = wrapper
      .findAll('.course-card__deadline-value')
      .map((deadline) => deadline.text());
    expect(deadlines).toEqual(['22 октября', '20 октября', 'Нет']);
  });

  it('показывает прогресс семестра перед карточками курсов', () => {
    const wrapper = mount(YourCoursesPage);
    const html = wrapper.html();
    expect(html.indexOf('semester-progress')).toBeLessThan(
      html.indexOf('course-card'),
    );
  });

  it('показывает сводку по семестру со средним баллом через запятую', () => {
    const wrapper = mount(YourCoursesPage);
    const summary = wrapper.find('.semester-progress').text();
    expect(summary).toContain('11 из 19 лабораторных выполнены');
    expect(summary).toContain('средний балл 4,82');
    expect(summary).toContain('57,9%');
  });

  it('отмечает выбранный семестр через aria-pressed', async () => {
    const wrapper = mount(YourCoursesPage);
    const buttons = wrapper.findAll('.courses-page__filter');
    expect(buttons[0]?.attributes('aria-pressed')).toBe('true');
    expect(buttons[1]?.attributes('aria-pressed')).toBe('false');

    await buttons[1]?.trigger('click');
    expect(buttons[0]?.attributes('aria-pressed')).toBe('false');
    expect(buttons[1]?.attributes('aria-pressed')).toBe('true');
  });

  it('во вкладке «Все семестры» показывает курсы всех семестров без сводки', async () => {
    const wrapper = mount(YourCoursesPage);
    await wrapper.findAll('.courses-page__filter')[1]?.trigger('click');
    expect(wrapper.findAll('.course-card')).toHaveLength(5);
    expect(wrapper.find('.semester-progress').exists()).toBe(false);
  });
});
