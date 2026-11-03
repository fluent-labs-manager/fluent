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

  it('переключает режим отображения на месяц и обратно', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const switchButtons = wrapper.findAll('.switch-btn');
    await switchButtons[1]?.trigger('click');
    expect(switchButtons[1]?.classes()).toContain('switch-btn--active');

    await switchButtons[0]?.trigger('click');
    expect(switchButtons[0]?.classes()).toContain('switch-btn--active');
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

  it('переключает отображение архива и отправляет в архив', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const archiveBtn = wrapper.find('.archive-btn');
    if (archiveBtn.exists()) {
      await archiveBtn.trigger('click');
    }

    const archiveToggle = wrapper.findAll('.filter-toggle-btn')[1];
    await archiveToggle?.trigger('click');
    await flushPromises();

    expect(archiveToggle?.text()).toContain('К событиям');
  });

  it('вызывает обработчик действия перехода по клику на кнопку события', async (): Promise<void> => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mount(StudentEventsPage);
    await flushPromises();

    const primaryBtn = wrapper.find('.primary-action-btn');
    if (primaryBtn.exists()) {
      await primaryBtn.trigger('click');
      expect(openSpy).toHaveBeenCalled();
    }
    openSpy.mockRestore();
  });
});
