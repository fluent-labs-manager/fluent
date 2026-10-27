import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import ScoreBuilderPage from '@/views/ScoreBuilderPage.vue';

describe('ScoreBuilderPage', () => {
  it('показывает заголовок страницы', () => {
    const wrapper = mount(ScoreBuilderPage);

    expect(wrapper.find('h1').text()).toBe('Конструктор баллов');
  });
});
