import { afterEach, describe, expect, it, vi } from 'vitest';

import { mount } from '@vue/test-utils';
import FileDropzone from '@/components/FileDropzone.vue';

function createFile(name: string): File {
  return new File(['содержимое'], name);
}

// в jsdom список файлов поля нельзя задать напрямую — подменяем свойство
function setInputFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
}

describe('FileDropzone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('подсказывает допустимые типы и размер', () => {
    const wrapper = mount(FileDropzone);

    expect(wrapper.find('.file-dropzone__hint').text()).toBe(
      'PDF, ZIP, IPYNB, PY, H, JAVA до 20 МБ',
    );
    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe(
      '.pdf,.zip,.ipynb,.py,.h,.java',
    );
  });

  it('«Выбрать файл» открывает окно выбора', async () => {
    const click = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const wrapper = mount(FileDropzone);

    await wrapper.find('button').trigger('click');

    expect(click).toHaveBeenCalledTimes(1);
  });

  it('сообщает о файле, выбранном в окне', async () => {
    const wrapper = mount(FileDropzone);
    const input = wrapper.find('input[type="file"]');
    const file = createFile('otchet.pdf');
    setInputFiles(input.element as HTMLInputElement, [file]);

    await input.trigger('change');

    expect(wrapper.emitted('select')).toEqual([[file]]);
  });

  it('если окно закрыли без выбора, ничего не сообщает', async () => {
    const wrapper = mount(FileDropzone);
    const input = wrapper.find('input[type="file"]');
    setInputFiles(input.element as HTMLInputElement, []);

    await input.trigger('change');

    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('из перетащенных файлов берёт первый', async () => {
    const wrapper = mount(FileDropzone);
    const first = createFile('main.py');

    await wrapper.trigger('drop', {
      dataTransfer: { files: [first, createFile('utils.py')] },
    });

    expect(wrapper.emitted('select')).toEqual([[first]]);
  });

  it('подсвечивается, пока файл держат над областью', async () => {
    const wrapper = mount(FileDropzone);

    await wrapper.trigger('dragover');
    expect(wrapper.classes()).toContain('file-dropzone--dragging');

    await wrapper.trigger('dragleave');
    expect(wrapper.classes()).not.toContain('file-dropzone--dragging');

    await wrapper.trigger('dragover');
    await wrapper.trigger('drop', { dataTransfer: { files: [] } });
    expect(wrapper.classes()).not.toContain('file-dropzone--dragging');
    expect(wrapper.emitted('select')).toBeUndefined();
  });
});
