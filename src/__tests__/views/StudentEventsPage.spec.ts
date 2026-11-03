import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import StudentEventsPage from '@/views/StudentEventsPage.vue';

describe('StudentEventsPage.vue', (): void => {
  it('рендерит заголовок страницы и имя пользователя', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.page-title').text()).toBe('События');
    expect(wrapper.find('.user-meta').text()).toContain('ГОРЕЛОВА УЛЬЯНА');
  });

  it('скрывает прочитанные события при переключении фильтра', async (): Promise<void> => {
    const wrapper = mount(StudentEventsPage);
    await new Promise((resolve) => setTimeout(resolve, 50));

    const filterBtn = wrapper.findAll('.filter-toggle-btn')[0];
    const initialCount = wrapper.findAll('.event-card').length;

    await filterBtn.trigger('click');
    const filteredCount = wrapper.findAll('.event-card').length;

    expect(filteredCount).toBeLessThan(initialCount);
  });
});
