import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import SpreadsheetPlaceholder from '@/components/SpreadsheetPlaceholder.vue';

describe('SpreadsheetPlaceholder', () => {
  it('поле и кнопка неактивны и связаны с подписью «Будет доступно позже»', () => {
    const wrapper = mount(SpreadsheetPlaceholder, {
      props: {
        title: 'Импорт Google Таблицы',
        actionLabel: 'Импортировать таблицу',
      },
    });
    const hint = wrapper.find('.spreadsheet-placeholder__hint');
    const controls = [wrapper.find('input'), ...wrapper.findAll('button')];

    expect(wrapper.find('h2').text()).toBe('Импорт Google Таблицы');
    expect(hint.text()).toBe('Будет доступно позже');
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
        title: 'Экспорт Google Таблицы',
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
      props: { title: 'Импорт Google Таблицы', actionLabel: 'Импорт' },
    });

    expect(wrapper.attributes('aria-labelledby')).toBe(
      wrapper.find('h2').attributes('id'),
    );
  });
});
