import { afterEach, describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import AddWorkForm from '@/components/AddWorkForm.vue';

function mountForm(): ReturnType<typeof mount> {
  return mount(AddWorkForm, {
    props: { existingTitles: ['Экзамен'] },
    attachTo: document.body,
  });
}

async function fill(
  wrapper: ReturnType<typeof mount>,
  title: string,
  score: string,
): Promise<void> {
  await wrapper.find('input[type="text"]').setValue(title);
  await wrapper.find('input[type="number"]').setValue(score);
  await wrapper.find('form').trigger('submit');
}

describe('AddWorkForm', () => {
  // useId в каждом mount начинает заново: поля прошлых тестов мешали бы
  // искать по id
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('у полей видимые подписи', () => {
    const wrapper = mountForm();
    const labels = wrapper.findAll('label');

    expect(labels.map((label) => label.text())).toEqual(['Название', 'Баллы']);
    for (const label of labels) {
      expect(wrapper.find(`#${label.attributes('for') ?? ''}`).exists()).toBe(
        true,
      );
    }
  });

  it('сообщает название без лишних пробелов и баллы числом', async () => {
    const wrapper = mountForm();

    await fill(wrapper, '  ЛР6  ', '10');

    expect(wrapper.emitted('add')).toEqual([['ЛР6', 10]]);
  });

  it('с ошибками ничего не сообщает и объясняет каждую', async () => {
    const wrapper = mountForm();

    await fill(wrapper, 'экзамен', '0');

    expect(wrapper.emitted('add')).toBeUndefined();
    expect(
      wrapper.findAll('.add-work-form__error').map((e) => e.text()),
    ).toEqual([
      'Работа с таким названием уже есть',
      'Баллы — целое число от 1 до 100',
    ]);
    const inputs = wrapper.findAll('input');
    for (const input of inputs) {
      expect(input.attributes('aria-invalid')).toBe('true');
      expect(input.attributes('aria-describedby')).toBeDefined();
    }
  });

  it('с ошибкой ставит фокус на первое неверное поле', async () => {
    const wrapper = mountForm();

    await fill(wrapper, 'ЛР6', '0');

    expect(document.activeElement).toBe(
      wrapper.find('input[type="number"]').element,
    );
  });

  it('ошибка поля пропадает, когда его исправляют', async () => {
    const wrapper = mountForm();
    await fill(wrapper, '', '5');

    await wrapper.find('input[type="text"]').setValue('ЛР6');

    expect(wrapper.find('.add-work-form__error').exists()).toBe(false);
  });

  it('«Отмена» и Escape закрывают форму', async () => {
    const wrapper = mountForm();

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Отмена')
      ?.trigger('click');
    await wrapper.find('form').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });
});
