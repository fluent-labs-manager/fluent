import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import RegistrationDetailsPage from '@/views/RegistrationDetailsPage.vue';

describe('RegistrationDetailsPage.vue', () => {
  it('рендерит заголовок заглушки', () => {
    const wrapper = mount(RegistrationDetailsPage);
    expect(wrapper.find('h1').text()).toBe('Потом доделаю');
  });
});
