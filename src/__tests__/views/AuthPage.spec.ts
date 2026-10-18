import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import AuthPage from '@/views/AuthPage.vue';

describe('AuthPage.vue', () => {
  it('рендерится корректно', () => {
    const wrapper = mount(AuthPage);
    expect(wrapper.find('.form-title').text()).toBe('Вход в аккаунт');
  });

  it('показывает ошибки валидации при пустой отправке', async () => {
    const wrapper = mount(AuthPage);
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.find('.field-error').exists()).toBe(true);
  });
});
