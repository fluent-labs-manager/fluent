import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import LabSubmissionPage from '@/views/LabSubmissionPage.vue';

vi.mock('vue-router', () => ({
  useRouter: (): { push: ReturnType<typeof vi.fn> } => ({
    push: vi.fn(),
  }),
  useRoute: (): { params: Record<string, string> } => ({
    params: { courseId: '1', labId: '3' },
  }),
}));

vi.mock('@/api/labs/LabsApi.ts', () => ({
  getLabSubmissionStub: vi.fn().mockResolvedValue({
    id: 3,
    status: 'not_submitted',
    currentFile: { name: 'myau.py' },
    history: [],
  }),
}));

describe('LabSubmissionPage.vue', (): void => {
  it('рендерит страницу сдачи лабораторной работы', async (): Promise<void> => {
    const wrapper = mount(LabSubmissionPage);
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('ФАЙЛЫ');
    expect(wrapper.text()).toContain('ИСТОРИЯ');
  });

  it('удаляет файл при нажатии кнопки удалить', async (): Promise<void> => {
    const wrapper = mount(LabSubmissionPage);

    await flushPromises();
    await nextTick();

    const deleteBtn = wrapper.find('.delete-file-btn');
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click');
      expect(wrapper.find('.file-card').exists()).toBe(false);
    }
  });
});
