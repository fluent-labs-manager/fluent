import { describe, expect, it } from 'vitest';

import { flushPromises } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
import WorkPool from '@/components/WorkPool.vue';
import { BarsSection } from '@/types/BarsSection.ts';
import { dispatchDrag, workDragData } from '../dragEvents.ts';

const existingTitles = ['Работа А', 'Работа Б', 'Экзамен'];

const works = [
  { id: 2, title: 'Работа Б', maxScore: 10, section: null },
  { id: 3, title: 'Экзамен', maxScore: 25, section: null },
];

describe('WorkPool', () => {
  it('показывает неразложенные работы', () => {
    const wrapper = mount(WorkPool, {
      props: { works, hasAnyWorks: true, existingTitles },
    });

    expect(wrapper.find('h2').text()).toBe('Работы курса');
    expect(
      wrapper.findAll('.work-chip__title').map((title) => title.text()),
    ).toEqual(['Работа Б', 'Экзамен']);
  });

  it('из чипа работу можно перенести в любой раздел', async () => {
    const wrapper = mount(WorkPool, {
      props: { works, hasAnyWorks: true, existingTitles },
    });

    await wrapper.find('.work-chip__button').trigger('click');
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(7);

    await wrapper.findAll('[role="menuitem"]')[4]?.trigger('click');
    expect(wrapper.emitted('move')).toEqual([[2, BarsSection.Exam]]);
  });

  it('когда всё разложено, так и пишет', () => {
    const wrapper = mount(WorkPool, {
      props: { works: [], hasAnyWorks: true, existingTitles },
    });

    expect(wrapper.text()).toContain('Все работы разложены по разделам.');
  });

  it('без работ у дисциплины пишет, что их нет', () => {
    const wrapper = mount(WorkPool, {
      props: { works: [], hasAnyWorks: false, existingTitles },
    });

    expect(wrapper.text()).toContain('У дисциплины пока нет работ.');
  });

  it('перетащенную из раздела работу возвращает в «Работы курса»', () => {
    const wrapper = mount(WorkPool, {
      props: { works, hasAnyWorks: true, existingTitles },
    });

    dispatchDrag(wrapper.element, 'drop', workDragData(1));

    expect(wrapper.emitted('move')).toEqual([[1, null]]);
  });

  describe('добавление работы', () => {
    async function openForm(): Promise<ReturnType<typeof mount>> {
      const wrapper = mount(WorkPool, {
        props: { works, hasAnyWorks: true, existingTitles },
        attachTo: document.body,
      });
      await wrapper.find('.work-pool__add').trigger('click');
      return wrapper;
    }

    it('«Добавить работу» открывает форму и ставит фокус в название', async () => {
      const wrapper = await openForm();

      expect(wrapper.find('.add-work-form').exists()).toBe(true);
      expect(wrapper.find('.work-pool__add').exists()).toBe(false);
      expect(document.activeElement).toBe(
        wrapper.find('.add-work-form input[type="text"]').element,
      );
      wrapper.unmount();
    });

    it('новую работу сообщает наружу и закрывает форму', async () => {
      const wrapper = await openForm();

      await wrapper.find('input[type="text"]').setValue('  ЛР6  ');
      await wrapper.find('input[type="number"]').setValue('10');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('add')).toEqual([['ЛР6', 10]]);
      expect(wrapper.find('.add-work-form').exists()).toBe(false);
      expect(document.activeElement).toBe(
        wrapper.find('.work-pool__add').element,
      );
      wrapper.unmount();
    });

    it('«Отмена» закрывает форму без новой работы', async () => {
      const wrapper = await openForm();

      await wrapper
        .findAll('.add-work-form button')
        .find((button) => button.text() === 'Отмена')
        ?.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('add')).toBeUndefined();
      expect(wrapper.find('.add-work-form').exists()).toBe(false);
      wrapper.unmount();
    });
  });

  it('правку баллов и удаление работы сообщает с её id', async () => {
    const wrapper = mount(WorkPool, {
      props: { works, hasAnyWorks: true, existingTitles },
    });

    await wrapper.find('.work-chip__button').trigger('click');
    await wrapper
      .findAll('[role="menuitem"]')
      .find((item) => item.text() === 'Удалить работу')
      ?.trigger('click');

    expect(wrapper.emitted('remove')).toEqual([[2]]);
  });
});
