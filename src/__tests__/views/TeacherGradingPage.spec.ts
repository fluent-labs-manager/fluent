import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TeacherGradingPage from '@/views/TeacherGradingPage.vue';

interface MockRouter {
  push: (to: Record<string, unknown>) => void;
}

vi.mock('vue-router', () => ({
  useRouter: (): MockRouter => ({
    push: vi.fn(),
  }),
}));

describe('TeacherGradingPage.vue', (): void => {
  it('рендерит заголовок оценивания и имя студента', (): void => {
    const wrapper = mount(TeacherGradingPage);
    expect(wrapper.find('.page-title').text()).toBe('Оценивание');
    expect(wrapper.find('.student-name').text()).toBe('Горелова Ульяна');
  });

  it('добавляет новый вопрос по клику на кнопку', async (): Promise<void> => {
    const wrapper = mount(TeacherGradingPage);
    const initialCount = wrapper.findAll('.question-block').length;

    await wrapper.find('.add-question-btn').trigger('click');
    expect(wrapper.findAll('.question-block').length).toBe(initialCount + 1);
  });

  it('показывает ошибку при некорректном балле', async (): Promise<void> => {
    const wrapper = mount(TeacherGradingPage);
    await wrapper.find('.grade-input').setValue(15);
    await wrapper.find('.save-grade-btn').trigger('click');

    expect(wrapper.find('.field-error').text()).toBe('Балл должен быть от 0 до 10');
  });
});
