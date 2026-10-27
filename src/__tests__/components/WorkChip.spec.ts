import { afterEach, describe, expect, it } from 'vitest';

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import WorkChip from '@/components/WorkChip.vue';
import { WORK_DRAG_TYPE } from '@/constants/barsSections.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import { getMoveTargets } from '@/utils/ScoreBuilder.ts';
import { createDataTransfer, dispatchDrag } from '../dragEvents.ts';

function mountChip(): ReturnType<typeof mount> {
  return mount(WorkChip, {
    props: {
      work: {
        id: 5,
        title: 'ЛР5',
        maxScore: 10,
        section: BarsSection.Labs,
      },
      targets: getMoveTargets(BarsSection.Labs),
    },
    attachTo: document.body,
  });
}

describe('WorkChip', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('показывает название и баллы, а экранному диктору — «ЛР5, 10 баллов»', () => {
    const button = mountChip().find('.work-chip__button');

    expect(button.find('.work-chip__title').text()).toBe('ЛР5');
    expect(button.find('.work-chip__score').text()).toBe('10');
    expect(button.attributes('aria-label')).toBe('ЛР5, 10 баллов');
  });

  it('по нажатию открывает список, куда перенести работу', async () => {
    const wrapper = mountChip();

    await wrapper.find('.work-chip__button').trigger('click');

    expect(wrapper.find('.work-chip__button').attributes('aria-expanded')).toBe(
      'true',
    );
    expect(
      wrapper.findAll('[role="menuitem"]').map((item) => item.text()),
    ).toEqual([
      'Работа на занятиях',
      'Контрольные работы',
      'Рубежный контроль',
      'Экзамен',
      'Вернуть в работы курса',
    ]);
  });

  it.each(['Enter', ' '])(
    'с клавиатуры список открывается клавишей «%s»',
    async (key) => {
      const wrapper = mountChip();

      await wrapper.find('.work-chip__button').trigger('keydown', { key });

      expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    },
  );

  it('чип можно выбрать с клавиатуры и перетащить', () => {
    const chip = mountChip().find('.work-chip__button');

    expect(chip.attributes('role')).toBe('button');
    expect(chip.attributes('tabindex')).toBe('0');
    expect(chip.attributes('draggable')).toBe('true');
  });

  it('выбор в списке переносит работу и закрывает список', async () => {
    const wrapper = mountChip();
    await wrapper.find('.work-chip__button').trigger('click');

    await wrapper.findAll('[role="menuitem"]')[3]?.trigger('click');

    expect(wrapper.emitted('move')).toEqual([[BarsSection.Exam]]);
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it('«Вернуть в работы курса» переносит работу в «Работы курса»', async () => {
    const wrapper = mountChip();
    await wrapper.find('.work-chip__button').trigger('click');

    await wrapper.findAll('[role="menuitem"]').at(-1)?.trigger('click');

    expect(wrapper.emitted('move')).toEqual([[null]]);
  });

  it('Escape закрывает список и возвращает фокус на чип', async () => {
    const wrapper = mountChip();
    await wrapper.find('.work-chip__button').trigger('click');

    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' });

    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
    expect(document.activeElement).toBe(
      wrapper.find('.work-chip__button').element,
    );
  });

  it('открытый список ставит фокус на первый пункт', async () => {
    const wrapper = mountChip();

    await wrapper.find('.work-chip__button').trigger('click');
    await nextTick();

    expect(document.activeElement).toBe(
      wrapper.find('[role="menuitem"]').element,
    );
  });

  it('клик мимо списка закрывает его', async () => {
    const wrapper = mountChip();
    await wrapper.find('.work-chip__button').trigger('click');
    await nextTick();

    document.body.click();
    await nextTick();

    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });

  it('при перетаскивании передаёт id работы и закрывает список', async () => {
    const wrapper = mountChip();
    await wrapper.find('.work-chip__button').trigger('click');
    const data = createDataTransfer();

    dispatchDrag(wrapper.find('.work-chip__button').element, 'dragstart', data);
    await nextTick();

    expect(data.getData(WORK_DRAG_TYPE)).toBe('5');
    expect(data.effectAllowed).toBe('move');
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });
});
