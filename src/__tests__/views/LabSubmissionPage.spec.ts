import { beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import LabSubmissionPage from '@/views/LabSubmissionPage.vue';
import { getLabSubmissionStub } from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';
import { labSubmissionFixture } from '../fixtures.ts';

vi.mock('@/api/labs/LabsApi.ts', () => ({ getLabSubmissionStub: vi.fn() }));

const mockedGetLabSubmission = vi.mocked(getLabSubmissionStub);

function mountPage(
  props: { courseId: number; labId: number } = { courseId: 11, labId: 2 },
): ReturnType<typeof mount> {
  return mount(LabSubmissionPage, {
    props,
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  });
}

// работа на проверке: одна попытка ждёт ответа преподавателя
function createPendingReview(): LabSubmission {
  const data = structuredClone(labSubmissionFixture);
  data.lab = {
    ...data.lab,
    status: LabStatus.PendingReview,
    variant: 42,
    submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
  };
  data.attempts = [
    {
      id: 23,
      number: 1,
      submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
      file: { name: 'otchet.pdf', size: 2_516_582 },
      comment: 'Выводы в конце.',
      teacherComment: null,
      result: AttemptResult.Pending,
    },
  ];

  return data;
}

function createSubmitted(): LabSubmission {
  const data = createPendingReview();
  data.lab = {
    ...data.lab,
    status: LabStatus.Submitted,
    variant: 42,
    grade: 4.2,
    submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
  };
  data.attempts = data.attempts.map((attempt) => ({
    ...attempt,
    teacherComment: 'Принято.',
    result: AttemptResult.Accepted,
  }));

  return data;
}

describe('LabSubmissionPage', () => {
  beforeEach(() => {
    mockedGetLabSubmission.mockReset();
    mockedGetLabSubmission.mockResolvedValue(
      structuredClone(labSubmissionFixture),
    );
  });

  it('пока данные загружаются, показывает статус загрузки', () => {
    mockedGetLabSubmission.mockReturnValue(new Promise(() => undefined));
    const wrapper = mountPage();

    expect(wrapper.find('[role="status"]').text()).toBe('Загрузка работы…');
    expect(wrapper.find('h1').exists()).toBe(false);
  });

  it('запрашивает работу по дисциплине и номеру из адреса', async () => {
    mountPage({ courseId: 11, labId: 2 });
    await flushPromises();

    expect(mockedGetLabSubmission).toHaveBeenCalledWith(11, 2);
  });

  it('«Назад» возвращает к дисциплине с этой же работой в карточке', async () => {
    const wrapper = mountPage();
    await flushPromises();
    const back = wrapper.findComponent(RouterLinkStub);

    expect(back.text()).toBe('Назад');
    expect(back.props('to')).toEqual({
      name: 'course-labs',
      params: { courseId: 11 },
      query: { lab: '2' },
    });
  });

  it('при ошибке показывает её текст и по «Повторить» загружает снова', async () => {
    mockedGetLabSubmission.mockRejectedValueOnce(
      new ApiRequestError(404, 'Работа не найдена'),
    );
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'Не удалось загрузить работу: Работа не найдена',
    );

    await wrapper.find('button[aria-label="Повторить"]').trigger('click');
    await flushPromises();

    expect(mockedGetLabSubmission).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('h1').text()).toBe('Лабораторная работа 2');
  });

  it('при неизвестной ошибке пишет «Неизвестная ошибка»', async () => {
    mockedGetLabSubmission.mockRejectedValueOnce(new Error('сбой'));
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'Неизвестная ошибка',
    );
  });

  it('при смене работы загружает новую, а ответ на прошлый запрос не показывает', async () => {
    let resolveFirst: (data: LabSubmission) => void = () => undefined;
    mockedGetLabSubmission.mockReturnValueOnce(
      new Promise<LabSubmission>((resolve) => {
        resolveFirst = resolve;
      }),
    );
    const wrapper = mountPage({ courseId: 11, labId: 1 });

    await wrapper.setProps({ courseId: 11, labId: 2 });
    await flushPromises();
    resolveFirst(createSubmitted());
    await flushPromises();

    expect(mockedGetLabSubmission).toHaveBeenLastCalledWith(11, 2);
    expect(wrapper.find('.lab-status-bar').text()).toBe('Не сдано');
  });

  describe('несданная работа', () => {
    it('в заголовке — только номер работы, рядом статус', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('h1').text()).toBe('Лабораторная работа 2');
      expect(wrapper.find('.lab-status-bar').text()).toBe('Не сдано');
    });

    it('показывает область для файла и комментарий', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('.file-dropzone').text()).toContain(
        'Перетащите файл или выберите',
      );
      expect(wrapper.find('textarea').exists()).toBe(true);
      expect(wrapper.text()).toContain('Комментарий к работе');
    });

    it('без выбранного файла отправить работу нельзя', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const submit = wrapper.find('button[type="submit"]');

      expect(submit.text()).toBe('Отправить работу на проверку');
      expect(submit.attributes('disabled')).toBeDefined();
    });

    it('есть кнопка «Сохранить черновик»', async () => {
      const wrapper = mountPage();
      await flushPromises();

      const buttons = wrapper.findAll('button').map((button) => button.text());
      expect(buttons).toContain('Сохранить черновик');
    });

    it('в истории сверху последняя попытка, у каждой — результат и комментарий преподавателя', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const attempts = wrapper.findAll('.lab-attempt-card');

      expect(attempts.map((card) => card.find('h3').text())).toEqual([
        'Попытка 2 — 08.10.2026',
        'Попытка 1 — 18.09.2026',
      ]);
      expect(attempts[0]?.find('.lab-attempt-card__result').text()).toBe(
        'Отклонено',
      );
      expect(attempts[0]?.text()).toContain('Графики без подписей.');
      expect(attempts[0]?.text()).toContain('otchet_v2.pdf');
      expect(attempts[0]?.text()).toContain('2,4 МБ');
      expect(attempts[1]?.text()).toContain('Ваш комментарий: Первая версия.');
    });

    it('без попыток пишет, что их не было', async () => {
      mockedGetLabSubmission.mockResolvedValue({
        ...structuredClone(labSubmissionFixture),
        attempts: [],
      });
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.text()).toContain('Попыток пока не было.');
      expect(wrapper.find('.lab-attempt-card').exists()).toBe(false);
    });
  });

  describe('работа на проверке', () => {
    beforeEach(() => {
      mockedGetLabSubmission.mockResolvedValue(createPendingReview());
    });

    it('показывает отправленный файл без формы и без удаления', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const file = wrapper.find('.submitted-file-card');

      expect(wrapper.find('.lab-status-bar').text()).toBe('На проверке');
      expect(file.text()).toContain('otchet.pdf');
      expect(file.text()).toContain('Загружено 12 октября, 18:30 · 2,4 МБ');
      expect(file.find('.submitted-file-card__type').text()).toBe('PDF');
      expect(wrapper.text()).not.toContain('Удалить файл');
      expect(wrapper.find('form').exists()).toBe(false);
      expect(wrapper.find('.file-dropzone').exists()).toBe(false);
    });

    it('показывает комментарий студента к отправке', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('.lab-submission-page__note').text()).toBe(
        'Ваш комментарий: Выводы в конце.',
      );
    });

    it('попытка в истории — «На проверке»', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('.lab-attempt-card__result').text()).toBe(
        'На проверке',
      );
    });
  });

  describe('сданная работа', () => {
    beforeEach(() => {
      mockedGetLabSubmission.mockResolvedValue(createSubmitted());
    });

    it('рядом со статусом показывает оценку', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('.lab-status-bar').text()).toBe('Сдано · оценка 4,2');
    });

    it('только для просмотра: файл и попытка «Принято»', async () => {
      const wrapper = mountPage();
      await flushPromises();

      expect(wrapper.find('form').exists()).toBe(false);
      expect(wrapper.find('.submitted-file-card').exists()).toBe(true);
      expect(wrapper.find('.lab-attempt-card__result').text()).toBe('Принято');
    });
  });

  it('недоступная работа: сообщение без файлов и истории', async () => {
    const data = structuredClone(labSubmissionFixture);
    data.lab = {
      id: 3,
      number: 3,
      title: 'Работа В',
      status: LabStatus.Locked,
      deadline: toIsoDateTime('2026-10-29T23:59:00+03:00'),
    };
    data.attempts = [];
    mockedGetLabSubmission.mockResolvedValue(data);
    const wrapper = mountPage({ courseId: 11, labId: 3 });
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Лабораторная работа 3');
    expect(wrapper.text()).toContain('Работа пока недоступна');
    expect(wrapper.find('h2').exists()).toBe(false);
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.findComponent(RouterLinkStub).text()).toBe('Назад');
  });
});
