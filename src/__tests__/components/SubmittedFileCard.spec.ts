import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import SubmittedFileCard from '@/components/SubmittedFileCard.vue';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

function mountCard(removable?: boolean): ReturnType<typeof mount> {
  return mount(SubmittedFileCard, {
    props: {
      file: { name: 'otchet', size: 524_288 },
      uploadedAt: toIsoDateTime('2026-10-18T09:30:00+03:00'),
      removable,
    },
  });
}

describe('SubmittedFileCard', () => {
  it('показывает дату загрузки и размер', () => {
    expect(mountCard().text()).toContain(
      'Загружено 18 октября, 09:30 · 512 КБ',
    );
  });

  it('без расширения не показывает тип файла', () => {
    expect(mountCard().find('.submitted-file-card__type').exists()).toBe(false);
  });

  it('по умолчанию удалить файл нельзя', () => {
    expect(mountCard().find('button').exists()).toBe(false);
  });

  it('если удалять можно, по кнопке сообщает об удалении', async () => {
    const wrapper = mountCard(true);
    const remove = wrapper.find('button');

    expect(remove.text()).toBe('Удалить файл');
    await remove.trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });
});
