import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import HomePage from '@/views/HomePage.vue';

describe('HomePage', () => {
  it('отображает заголовок и сообщение о разработке раздела', () => {
    const wrapper = mount(HomePage);
    expect(wrapper.find('h1').text()).toBe('Главная');
    expect(wrapper.text()).toContain('Раздел в разработке');
  });
});
