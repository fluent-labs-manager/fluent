import { afterEach, describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import WorkScoreForm from '@/components/WorkScoreForm.vue';

function mountForm(): ReturnType<typeof mount> {
  return mount(WorkScoreForm, {
    props: { title: 'ЛР5', score: 10 },
    attachTo: document.body,
  });
}

describe('WorkScoreForm', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('поле подписано названием работы, в нём текущие баллы и фокус', () => {
    const wrapper = mountForm();
    const input = wrapper.find('input');

    expect(
      wrapper.find(`label[for="${input.attributes('id') ?? ''}"]`).text(),
    ).toBe('ЛР5');
    expect((input.element as HTMLInputElement).value).toBe('10');
    expect(document.activeElement).toBe(input.element);
  });

  it('сохраняет новые баллы', async () => {
    const wrapper = mountForm();

    await wrapper.find('input').setValue('15');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('save')).toEqual([[15]]);
  });

  it('неверные баллы не сохраняет и объясняет почему', async () => {
    const wrapper = mountForm();

    await wrapper.find('input').setValue('0');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Баллы — целое число от 1 до 100',
    );
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('кнопка с крестиком и Escape отменяют правку', async () => {
    const wrapper = mountForm();

    await wrapper.find('button[aria-label="Отменить"]').trigger('click');
    await wrapper.find('form').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });
});
