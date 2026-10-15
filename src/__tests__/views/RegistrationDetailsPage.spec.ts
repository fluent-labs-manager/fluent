import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import RegistrationDetailsPage from '@/views/RegistrationDetailsPage.vue';

interface MockRouter {
  push: (to: Record<string, unknown>) => void;
}

interface MockRoute {
  query: Record<string, string>;
}

vi.mock('vue-router', () => ({
  useRouter: (): MockRouter => ({
    push: vi.fn(),
  }),
  useRoute: (): MockRoute => ({
    query: { role: 'student' },
  }),
}));

describe('RegistrationDetailsPage.vue', (): void => {
  it('рендерит заголовок страницы', (): void => {
    const wrapper = mount(RegistrationDetailsPage);
    expect(wrapper.find('.title').text()).toBe('Детали профиля');
  });

  it('показывает ошибку при неверном коде подтверждения', async (): Promise<void> => {
    const wrapper = mount(RegistrationDetailsPage);
    await wrapper.find('#verificationCode').setValue('abc');
    await wrapper.find('.details-form').trigger('submit.prevent');

    expect(wrapper.find('.field-error').text()).toBe(
      'Код должен состоять ровно из 6 цифр',
    );
  });

  it('показывает ошибку при пустом email при отправке кода', async (): Promise<void> => {
    const wrapper = mount(RegistrationDetailsPage);
    await wrapper.find('#corporateEmail').setValue('');
    await wrapper.find('.code-btn').trigger('click');

    expect(wrapper.text()).toContain('Введите email');
  });
});
