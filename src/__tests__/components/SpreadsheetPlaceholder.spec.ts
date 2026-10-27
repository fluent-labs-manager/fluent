import { afterEach, describe, expect, it, vi } from 'vitest';

import { mount } from '@vue/test-utils';
import SpreadsheetPlaceholder from '@/components/SpreadsheetPlaceholder.vue';

describe('SpreadsheetPlaceholder', () => {
  // подсказка PrimeVue добавляется в конец body
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('при наведении на кнопку подсказывает «Скоро будет доступно»', async () => {
    const wrapper = mount(SpreadsheetPlaceholder, {
      props: {
        title: 'Экспорт Google-таблицы',
        actionLabel: 'Экспортировать таблицу',
        secondaryActionLabel: 'Создать вкладки по группам',
      },
      attachTo: document.body,
    });

    // неактивная кнопка наведение не ловит, поэтому подсказка — на обёртке
    for (const button of wrapper.findAll('button')) {
      button.element.parentElement?.dispatchEvent(new MouseEvent('mouseenter'));
      await vi.waitFor(() => {
        expect(
          document.body.querySelector('.p-tooltip-text')?.textContent,
        ).toBe('Скоро будет доступно');
      });
      button.element.parentElement?.dispatchEvent(new MouseEvent('mouseleave'));
      await vi.waitFor(() => {
        expect(document.body.querySelector('.p-tooltip')).toBeNull();
      });
    }
    wrapper.unmount();
  });

  it('поле и кнопка неактивны и связаны с подписью «Скоро будет доступно»', () => {
    const wrapper = mount(SpreadsheetPlaceholder, {
      props: {
        title: 'Импорт Google-таблицы',
        actionLabel: 'Импортировать таблицу',
      },
    });
    const hint = wrapper.find('.spreadsheet-placeholder__hint');
    const controls = [wrapper.find('input'), ...wrapper.findAll('button')];

    expect(wrapper.find('h2').text()).toBe('Импорт Google-таблицы');
    expect(hint.text()).toBe('Скоро будет доступно');
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
      'Импортировать таблицу',
    ]);
    for (const control of controls) {
      expect(control.attributes('disabled')).toBeDefined();
      expect(control.attributes('aria-describedby')).toBe(
        hint.attributes('id'),
      );
    }
    expect(wrapper.find('input').attributes('aria-label')).toBe(
      'Ссылка на Google-таблицу',
    );
  });

  it('может показать второе действие', () => {
    const wrapper = mount(SpreadsheetPlaceholder, {
      props: {
        title: 'Экспорт Google-таблицы',
        actionLabel: 'Экспортировать таблицу',
        secondaryActionLabel: 'Создать вкладки по группам',
      },
    });

    expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
      'Экспортировать таблицу',
      'Создать вкладки по группам',
    ]);
  });

  it('карточка — область с именем из заголовка', () => {
    const wrapper = mount(SpreadsheetPlaceholder, {
      props: { title: 'Импорт Google-таблицы', actionLabel: 'Импорт' },
    });

    expect(wrapper.attributes('aria-labelledby')).toBe(
      wrapper.find('h2').attributes('id'),
    );
  });
});
