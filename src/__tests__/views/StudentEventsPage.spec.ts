import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import StudentEventsPage from '@/views/StudentEventsPage.vue';
import { mockEventsData } from '@/mocks/events.ts';

vi.mock('@/api/events/EventsApi.ts', () => ({
  getStudentEventsStub: vi.fn(() =>
    Promise.resolve(structuredClone(mockEventsData)),
  ),
}));

describe('StudentEventsPage.vue', (): void => {
  it('рендерит заголовок страницы и имя пользователя', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    expect(wrapper.find('.page-title').text()).toBe('События');
    expect(wrapper.find('.user-meta').text()).toContain('ГОРЕЛОВА УЛЬЯНА');
  });

  it('переключает месяцы кнопками стрелок', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    expect(wrapper.find('.month-label').text()).toContain('Октябрь 2026');

    const nextBtn = wrapper.findAll('.month-btn')[1];
    await nextBtn?.trigger('click');
    expect(wrapper.find('.month-label').text()).toContain('Ноябрь 2026');

    const prevBtn = wrapper.findAll('.month-btn')[0];
    await prevBtn?.trigger('click');
    expect(wrapper.find('.month-label').text()).toContain('Октябрь 2026');
  });

  it('переключает режим отображения между списком и месяцем', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const switchBtns = wrapper.findAll('.switch-btn');
    await switchBtns[1]?.trigger('click');
    expect(wrapper.find('.month-view-container').exists()).toBe(true);

    await switchBtns[0]?.trigger('click');
    expect(wrapper.find('.events-workspace').exists()).toBe(true);
  });

  it('скрывает прочитанные события при переключении фильтра', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const initialCount = wrapper.findAll('.event-card').length;
    expect(initialCount).toBeGreaterThan(0);

    const filterBtn = wrapper.findAll('.filter-toggle-btn')[0];
    await filterBtn?.trigger('click');
    await flushPromises();

    const filteredCount = wrapper.findAll('.event-card').length;
    expect(filteredCount).toBeLessThan(initialCount);
  });

  it('помечает событие прочитанным при клике на карточку', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const firstCard = wrapper.find('.event-card');
    await firstCard.trigger('click');
    await flushPromises();

    expect(firstCard.classes()).toContain('event-card--read');
  });

  it('фильтрует события по клику на день календаря', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const day20 = wrapper
      .findAll('.day-cell')
      .find((cell) => cell.text().includes('20'));
    await day20?.trigger('click');
    await flushPromises();

    const cards = wrapper.findAll('.event-card');
    expect(cards.length).toBe(2);
  });
});
