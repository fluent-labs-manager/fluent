import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import RegistrationRolePage from '@/views/RegistrationRolePage.vue';

interface MockRouter {
  push: (to: Record<string, unknown>) => void;
}

vi.mock('vue-router', () => ({
  useRouter: (): MockRouter => ({
    push: vi.fn(),
  }),
}));

describe('RegistrationRolePage.vue', (): void => {
  it('рендерит заголовок регистрации', (): void => {
    const wrapper = mount(RegistrationRolePage);
    expect(wrapper.find('.title').text()).toBe('Регистрация');
  });

  it('показывает ошибку при пустом ФИО', async (): Promise<void> => {
    const wrapper = mount(RegistrationRolePage);
    const input = wrapper.find('.field-input');
    await input.setValue('');
    await wrapper.find('.submit-btn').trigger('click');

    expect(wrapper.find('.field-error').text()).toBe('Введите ФИО');
  });
});
