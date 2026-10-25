import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import LabSubmissionPage from '@/views/LabSubmissionPage.vue';

interface MockRouter {
  push: (to: Record<string, unknown>) => void;
}

vi.mock('vue-router', () => ({
  useRouter: (): MockRouter => ({
    push: vi.fn(),
  }),
  useRoute: (): { params: Record<string, string> } => ({
    params: { courseId: '1', labId: '3' },
  }),
}));

describe('LabSubmissionPage.vue', (): void => {
  it('рендерит страницу сдачи лабораторной работы', async (): Promise<void> => {
    const wrapper = mount(LabSubmissionPage);
    await flushPromises();

    expect(wrapper.text()).toContain('ФАЙЛЫ');
    expect(wrapper.text()).toContain('ИСТОРИЯ');
  });

  it('удаляет файл при нажатии кнопки удалить', async (): Promise<void> => {
    const wrapper = mount(LabSubmissionPage);
    await flushPromises();

    const deleteBtn = wrapper.find('.delete-file-btn');
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click');
      expect(wrapper.find('.file-card').exists()).toBe(false);
    }
  });
});
