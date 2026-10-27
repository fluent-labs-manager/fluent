import { afterEach, describe, expect, it, vi } from 'vitest';

import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
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
      'Изменить баллы',
      'Удалить работу',
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

    await wrapper
      .findAll('[role="menuitem"]')
      .find((item) => item.text() === 'Вернуть в работы курса')
      ?.trigger('click');

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

  describe('правка и удаление', () => {
    async function chooseAction(
      wrapper: ReturnType<typeof mount>,
      action: string,
    ): Promise<void> {
      await wrapper.find('.work-chip__button').trigger('click');
      await wrapper
        .findAll('[role="menuitem"]')
        .find((item) => item.text() === action)
        ?.trigger('click');
      await flushPromises();
    }

    it('«Изменить баллы» превращает чип в поле с баллами', async () => {
      const wrapper = mountChip();

      await chooseAction(wrapper, 'Изменить баллы');

      expect(wrapper.find('.work-chip__button').exists()).toBe(false);
      const input = wrapper.find('.work-score-form__input');
      expect((input.element as HTMLInputElement).value).toBe('10');
      expect(document.activeElement).toBe(input.element);
    });

    it('новые баллы сообщает и возвращает чип с фокусом', async () => {
      const wrapper = mountChip();
      await chooseAction(wrapper, 'Изменить баллы');

      await wrapper.find('.work-score-form__input').setValue('15');
      await wrapper.find('.work-score-form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('updateScore')).toEqual([[15]]);
      expect(document.activeElement).toBe(
        wrapper.find('.work-chip__button').element,
      );
    });

    it('Escape отменяет правку баллов', async () => {
      const wrapper = mountChip();
      await chooseAction(wrapper, 'Изменить баллы');

      await wrapper
        .find('.work-score-form')
        .trigger('keydown', { key: 'Escape' });
      await flushPromises();

      expect(wrapper.emitted('updateScore')).toBeUndefined();
      expect(wrapper.find('.work-chip__button').exists()).toBe(true);
    });

    it('«Удалить работу» сообщает об удалении', async () => {
      const wrapper = mountChip();

      await chooseAction(wrapper, 'Удалить работу');

      expect(wrapper.emitted('remove')).toEqual([[]]);
      expect(wrapper.find('[role="menu"]').exists()).toBe(false);
    });
  });

  it('у правого края экрана раскрывает меню влево', async () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 20000, 100));
    const wrapper = mountChip();

    await wrapper.find('.work-chip__button').trigger('click');
    await flushPromises();

    expect(wrapper.find('[role="menu"]').classes()).toContain(
      'work-chip__menu--right',
    );
    rect.mockRestore();
  });

  it('если места хватает, раскрывает меню вправо', async () => {
    const wrapper = mountChip();

    await wrapper.find('.work-chip__button').trigger('click');
    await flushPromises();

    expect(wrapper.find('[role="menu"]').classes()).not.toContain(
      'work-chip__menu--right',
    );
  });

  describe('меню с клавиатуры', () => {
    async function openMenu(): Promise<ReturnType<typeof mount>> {
      const wrapper = mountChip();
      await wrapper.find('.work-chip__button').trigger('click');
      await flushPromises();
      return wrapper;
    }

    function focusedItem(): string | undefined {
      return document.activeElement?.textContent.trim();
    }

    it('пункты не в порядке Tab: по ним ходят стрелками', async () => {
      const wrapper = await openMenu();

      for (const item of wrapper.findAll('[role="menuitem"]')) {
        expect(item.attributes('tabindex')).toBe('-1');
      }
    });

    it('стрелки ходят по пунктам по кругу, Home и End — к краям', async () => {
      const wrapper = await openMenu();
      const menu = wrapper.find('[role="menu"]');
      expect(focusedItem()).toBe('Работа на занятиях');

      await menu.trigger('keydown', { key: 'ArrowDown' });
      expect(focusedItem()).toBe('Контрольные работы');

      await menu.trigger('keydown', { key: 'ArrowUp' });
      await menu.trigger('keydown', { key: 'ArrowUp' });
      expect(focusedItem()).toBe('Удалить работу');

      await menu.trigger('keydown', { key: 'Home' });
      expect(focusedItem()).toBe('Работа на занятиях');

      await menu.trigger('keydown', { key: 'End' });
      expect(focusedItem()).toBe('Удалить работу');
    });

    it('Tab закрывает меню и возвращает фокус на чип', async () => {
      const wrapper = await openMenu();

      await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Tab' });

      expect(wrapper.find('[role="menu"]').exists()).toBe(false);
      expect(document.activeElement).toBe(
        wrapper.find('.work-chip__button').element,
      );
    });
  });

  it('клик мимо закрывает правку баллов без сохранения и не трогает фокус', async () => {
    const wrapper = mountChip();
    const outside = document.createElement('button');
    document.body.append(outside);
    await wrapper.find('.work-chip__button').trigger('click');
    await wrapper
      .findAll('[role="menuitem"]')
      .find((item) => item.text() === 'Изменить баллы')
      ?.trigger('click');
    await flushPromises();
    expect(wrapper.find('.work-score-form').exists()).toBe(true);

    outside.focus();
    outside.click();
    await flushPromises();

    expect(wrapper.find('.work-score-form').exists()).toBe(false);
    expect(wrapper.emitted('updateScore')).toBeUndefined();
    expect(document.activeElement).toBe(outside);
  });

  it('у чипа метка с id работы — по ней возвращают фокус', () => {
    expect(
      mountChip().find('.work-chip__button').attributes('data-work-id'),
    ).toBe('5');
  });
});
