import { describe, expect, it } from 'vitest';

import { mount, RouterLinkStub } from '@vue/test-utils';
import LabSubmissionPage from '@/views/LabSubmissionPage.vue';

function mountPage(): ReturnType<typeof mount> {
  return mount(LabSubmissionPage, {
    props: { courseId: 11, labId: 2 },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  });
}

describe('LabSubmissionPage', () => {
  it('показывает заголовок страницы', () => {
    const wrapper = mountPage();

    expect(wrapper.find('h1').text()).toBe('Лабораторная работа');
  });

  it('«Назад» возвращает к дисциплине с этой же работой в карточке', () => {
    const wrapper = mountPage();
    const back = wrapper.findComponent(RouterLinkStub);

    expect(back.text()).toBe('Назад');
    expect(back.props('to')).toEqual({
      name: 'course-labs',
      params: { courseId: 11 },
      query: { lab: '2' },
    });
  });
});
