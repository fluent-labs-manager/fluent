import { beforeEach, describe, expect, it, vi } from 'vitest';

import { nextTick, ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { getCourseGradebookStub } from '@/api/gradebook/GradebookApi.ts';
import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import { useCourseGradebook } from '@/composables/useCourseGradebook.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { courseGradebookFixture } from '../fixtures.ts';

vi.mock('@/api/gradebook/GradebookApi.ts', () => ({
  getCourseGradebookStub: vi.fn(),
}));

const mockedGetGradebook = vi.mocked(getCourseGradebookStub);

describe('useCourseGradebook', () => {
  beforeEach(() => {
    mockedGetGradebook.mockReset();
    mockedGetGradebook.mockResolvedValue(
      structuredClone(courseGradebookFixture),
    );
  });

  it('пока дисциплина не выбрана, ничего не загружает', async () => {
    const { gradebook, isLoading, error } = useCourseGradebook(null);
    await flushPromises();

    expect(mockedGetGradebook).not.toHaveBeenCalled();
    expect(gradebook.value).toBeNull();
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('загружает ведомость выбранной дисциплины', async () => {
    const { gradebook, isLoading } = useCourseGradebook(11);

    expect(isLoading.value).toBe(true);
    await flushPromises();

    expect(mockedGetGradebook).toHaveBeenCalledWith(11);
    expect(gradebook.value).toEqual(courseGradebookFixture);
    expect(isLoading.value).toBe(false);
  });

  it('при ошибке показывает её текст, а reload загружает снова', async () => {
    mockedGetGradebook.mockRejectedValueOnce(
      new ApiRequestError(404, 'Дисциплина не найдена'),
    );
    const { gradebook, error, reload } = useCourseGradebook(11);
    await flushPromises();

    expect(error.value).toBe('Дисциплина не найдена');
    expect(gradebook.value).toBeNull();

    await reload();

    expect(error.value).toBeNull();
    expect(gradebook.value).toEqual(courseGradebookFixture);
  });

  it('при неизвестной ошибке пишет «Неизвестная ошибка»', async () => {
    mockedGetGradebook.mockRejectedValueOnce(new Error('сбой'));
    const { error } = useCourseGradebook(11);
    await flushPromises();

    expect(error.value).toBe('Неизвестная ошибка');
  });

  it('при смене дисциплины ответ на прошлый запрос не показывает', async () => {
    let resolveFirst: (data: CourseGradebook) => void = () => undefined;
    mockedGetGradebook.mockReturnValueOnce(
      new Promise<CourseGradebook>((resolve) => {
        resolveFirst = resolve;
      }),
    );
    const courseId = ref<number | null>(11);
    const { gradebook } = useCourseGradebook(courseId);

    courseId.value = 12;
    await nextTick();
    await flushPromises();
    resolveFirst({ ...courseGradebookFixture, courseTitle: 'Устаревший' });
    await flushPromises();

    expect(mockedGetGradebook).toHaveBeenLastCalledWith(12);
    expect(gradebook.value?.courseTitle).toBe('Курс А');
  });

  it('пока грузится другая дисциплина, прошлой ведомости нет', async () => {
    const courseId = ref<number | null>(11);
    const { gradebook } = useCourseGradebook(courseId);
    await flushPromises();
    mockedGetGradebook.mockReturnValueOnce(new Promise(() => undefined));

    courseId.value = 12;
    await nextTick();

    expect(gradebook.value).toBeNull();
  });
});
