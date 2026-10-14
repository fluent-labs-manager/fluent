import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import RegistrationRolePage from '@/views/RegistrationRolePage.vue';

// Мокаем useRouter
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('RegistrationRolePage.vue', () => {
  it('рендерит заголовок регистрации', () => {
    const wrapper = mount(RegistrationRolePage);
    expect(wrapper.find('.title').text()).toBe('Регистрация');
  });

  it('показывает ошибку при пустом ФИО', async () => {
    const wrapper = mount(RegistrationRolePage);
    await wrapper.find('.field-input').setValue('');
    await wrapper.find('.submit-btn').trigger('click');

    expect(wrapper.find('.field-error').text()).toBe('Введите ФИО');
  });
});
