import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import ScoreSummary from '@/components/ScoreSummary.vue';

function mountSummary(
  props: Partial<{
    distributedScore: number;
    isOverMaxScore: boolean;
    admissionThreshold: number;
  }> = {},
): ReturnType<typeof mount> {
  return mount(ScoreSummary, {
    props: {
      distributedScore: 50,
      maxScore: 100,
      isOverMaxScore: false,
      admissionThreshold: 60,
      ...props,
    },
  });
}

describe('ScoreSummary', () => {
  it('показывает, сколько баллов распределено из 100', () => {
    const wrapper = mountSummary();

    expect(
      wrapper.find('.score-summary__total').text().replace(/\s+/g, ' '),
    ).toBe('Распределено 50 из 100');
  });

  it('превышение выделяет', () => {
    const wrapper = mountSummary({
      distributedScore: 110,
      isOverMaxScore: true,
    });

    expect(wrapper.find('.score-summary__value').classes()).toContain(
      'score-summary__value--over',
    );
  });

  it('показывает порог допуска', () => {
    const wrapper = mountSummary();

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(
      '60',
    );
    expect(wrapper.find('.score-summary__admission').text()).toContain(
      'Допуск от',
    );
  });

  it('новый порог сообщает наружу', async () => {
    const wrapper = mountSummary();

    await wrapper.find('input').setValue('55');

    expect(wrapper.emitted('update:admissionThreshold')).toEqual([[55]]);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it.each(['', '-1', '101', '55.5'])(
    'неверный порог «%s» не принимает и объясняет почему',
    async (value) => {
      const wrapper = mountSummary();

      await wrapper.find('input').setValue(value);

      expect(wrapper.emitted('update:admissionThreshold')).toBeUndefined();
      expect(wrapper.find('[role="alert"]').text()).toBe(
        'Порог — целое число от 0 до 100',
      );
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    },
  );

  it('при смене дисциплины показывает её порог и убирает ошибку', async () => {
    const wrapper = mountSummary();
    await wrapper.find('input').setValue('abc');

    await wrapper.setProps({ admissionThreshold: 70 });

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(
      '70',
    );
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('поле порога подписано и связано с подсказкой «баллов»', () => {
    const wrapper = mountSummary();
    const input = wrapper.find('input');

    expect(
      wrapper.find(`label[for="${input.attributes('id') ?? ''}"]`).text(),
    ).toBe('Допуск от');
    expect(
      wrapper.find(`#${input.attributes('aria-describedby') ?? ''}`).text(),
    ).toBe('баллов');
  });
});
