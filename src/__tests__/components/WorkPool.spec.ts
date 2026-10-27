import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import WorkPool from '@/components/WorkPool.vue';
import { BarsSection } from '@/types/BarsSection.ts';
import { dispatchDrag, workDragData } from '../dragEvents.ts';

const works = [
  { id: 2, title: 'Работа Б', maxScore: 10, section: null },
  { id: 3, title: 'Экзамен', maxScore: 25, section: null },
];

describe('WorkPool', () => {
  it('показывает неразложенные работы', () => {
    const wrapper = mount(WorkPool, { props: { works, hasAnyWorks: true } });

    expect(wrapper.find('h2').text()).toBe('Работы курса');
    expect(
      wrapper.findAll('.work-chip__title').map((title) => title.text()),
    ).toEqual(['Работа Б', 'Экзамен']);
  });

  it('из чипа работу можно перенести в любой раздел', async () => {
    const wrapper = mount(WorkPool, { props: { works, hasAnyWorks: true } });

    await wrapper.find('.work-chip__button').trigger('click');
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(5);

    await wrapper.findAll('[role="menuitem"]')[4]?.trigger('click');
    expect(wrapper.emitted('move')).toEqual([[2, BarsSection.Exam]]);
  });

  it('когда всё разложено, так и пишет', () => {
    const wrapper = mount(WorkPool, {
      props: { works: [], hasAnyWorks: true },
    });

    expect(wrapper.text()).toContain('Все работы разложены по разделам.');
  });

  it('без работ у дисциплины пишет, что их нет', () => {
    const wrapper = mount(WorkPool, {
      props: { works: [], hasAnyWorks: false },
    });

    expect(wrapper.text()).toContain('У дисциплины пока нет работ.');
  });

  it('перетащенную из раздела работу возвращает в «Работы курса»', () => {
    const wrapper = mount(WorkPool, { props: { works, hasAnyWorks: true } });

    dispatchDrag(wrapper.element, 'drop', workDragData(1));

    expect(wrapper.emitted('move')).toEqual([[1, null]]);
  });
});
