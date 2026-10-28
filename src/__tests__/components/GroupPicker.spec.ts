import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import GroupPicker from '@/components/GroupPicker.vue';
import { courseGradebookFixture } from '../fixtures.ts';

function mountPicker(checkedNames: string[]): ReturnType<typeof mount> {
  return mount(GroupPicker, {
    props: { groups: courseGradebookFixture.groups, checkedNames },
  });
}

describe('GroupPicker', () => {
  it('показывает группы с числом студентов и отметки', () => {
    const wrapper = mountPicker(['P0001']);
    const options = wrapper.findAll('label');

    // пробелы схлопываем, как браузер
    expect(options.map((option) => option.text().replace(/\s+/g, ' '))).toEqual(
      ['P0001 2 студента', 'P0002 1 студент'],
    );
    expect(
      options.map(
        (option) => (option.find('input').element as HTMLInputElement).checked,
      ),
    ).toEqual([true, false]);
  });

  it('сообщает, какую группу отметили или сняли', async () => {
    const wrapper = mountPicker(['P0001']);
    const checkboxes = wrapper.findAll('input');

    await checkboxes[1]?.setValue(true);
    await checkboxes[0]?.setValue(false);

    expect(wrapper.emitted('change')).toEqual([
      ['P0002', true],
      ['P0001', false],
    ]);
  });

  it('без отмеченных групп подсказывает отметить хотя бы одну', () => {
    expect(mountPicker([]).find('.group-picker__hint').exists()).toBe(true);
    expect(mountPicker(['P0001']).find('.group-picker__hint').exists()).toBe(
      false,
    );
  });
});
