import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TeacherReviewQueuePage from '@/views/TeacherReviewQueuePage.vue';

interface MockRouter {
  push: (to: Record<string, unknown>) => void;
}

vi.mock('vue-router', () => ({
  useRouter: (): MockRouter => ({
    push: vi.fn(),
  }),
}));

describe('TeacherReviewQueuePage.vue', (): void => {
  it('рендерит название курса и список студентов в очереди', (): void => {
    const wrapper = mount(TeacherReviewQueuePage);
    expect(wrapper.find('.queue-title').text()).toBe(
      'Разработка Веб-приложений',
    );
    expect(wrapper.findAll('.student-item').length).toBeGreaterThan(0);
  });

  it('переходит к оцениванию при клике на студента', async (): Promise<void> => {
    const wrapper = mount(TeacherReviewQueuePage);
    await wrapper.find('.student-item').trigger('click');
    expect(wrapper.find('.student-item').exists()).toBe(true);
  });
});
