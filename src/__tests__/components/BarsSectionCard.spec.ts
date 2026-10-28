import { describe, expect, it } from 'vitest';

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import BarsSectionCard from '@/components/BarsSectionCard.vue';
import { BarsSection } from '@/types/BarsSection.ts';
import type { SectionSummary } from '@/types/SectionSummary.ts';
import { dispatchDrag, workDragData } from '../dragEvents.ts';

function createSummary(
  overrides: Partial<SectionSummary> = {},
): SectionSummary {
  return {
    section: BarsSection.Labs,
    title: 'Лабораторные работы',
    limit: 30,
    score: 15,
    isOverLimit: false,
    works: [{ id: 3, title: 'ЛР3', maxScore: 15, section: BarsSection.Labs }],
    ...overrides,
  };
}

describe('BarsSectionCard', () => {
  it('показывает раздел, его сумму из лимита и работы', () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary() },
    });

    expect(wrapper.find('h3').text()).toBe('Лабораторные работы');
    expect(wrapper.find('.bars-section-card__score').text()).toBe('15 из 30');
    expect(wrapper.findAll('.work-chip')).toHaveLength(1);
  });

  it('сумму сверх лимита выделяет', () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary({ score: 35, isOverLimit: true }) },
    });

    expect(wrapper.find('.bars-section-card__score').classes()).toContain(
      'bars-section-card__score--over',
    );
  });

  it('пустой раздел предлагает перетащить работу', () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary({ score: 0, works: [] }) },
    });

    expect(wrapper.text()).toContain('Перетащите вид работы');
  });

  it('из чипа можно перенести работу в другой раздел, но не в этот же', async () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary() },
    });

    await wrapper.find('.work-chip__button').trigger('click');
    const items = wrapper
      .findAll('[role="menuitem"]')
      .map((item) => item.text());
    expect(items).not.toContain('Лабораторные работы');
    expect(items).toContain('Вернуть в работы курса');

    await wrapper.findAll('[role="menuitem"]')[0]?.trigger('click');
    expect(wrapper.emitted('move')).toEqual([[3, BarsSection.ClassWork]]);
  });

  it('перетащенную работу кладёт в этот раздел', async () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary() },
    });
    const data = workDragData(8);

    dispatchDrag(wrapper.element, 'dragenter', data);
    await nextTick();
    expect(wrapper.classes()).toContain('bars-section-card--drag-over');

    dispatchDrag(wrapper.element, 'drop', data);
    await nextTick();

    expect(wrapper.emitted('move')).toEqual([[8, BarsSection.Labs]]);
    expect(wrapper.classes()).not.toContain('bars-section-card--drag-over');
  });

  it('удаление работы из раздела сообщает с её id', async () => {
    const wrapper = mount(BarsSectionCard, {
      props: { summary: createSummary() },
    });

    await wrapper.find('.work-chip__button').trigger('click');
    await wrapper
      .findAll('[role="menuitem"]')
      .find((item) => item.text() === 'Удалить работу')
      ?.trigger('click');

    expect(wrapper.emitted('remove')).toEqual([[3]]);
  });
});
