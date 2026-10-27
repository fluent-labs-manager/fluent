import { beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import LabSubmissionPage from '@/views/LabSubmissionPage.vue';
import {
  getLabSubmissionStub,
  submitLabAttemptStub,
} from '@/api/labs/LabsApi.ts';
import type { LabSubmission } from '@/api/labs/LabSubmission.dto.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';
import { labSubmissionFixture } from '../fixtures.ts';

vi.mock('@/api/labs/LabsApi.ts', () => ({
  getLabSubmissionStub: vi.fn(),
  submitLabAttemptStub: vi.fn(),
}));

const mockedGetLabSubmission = vi.mocked(getLabSubmissionStub);
const mockedSubmit = vi.mocked(submitLabAttemptStub);

interface PendingSubmit {
  resolve: (data: LabSubmission) => void;
  reject: (error: unknown) => void;
  // сообщить странице, сколько процентов файла загружено
  progress: (percent: number) => void;
}

// отправка, которая завершается вручную: так видно состояние во время загрузки
function createPendingSubmit(): PendingSubmit {
  const pending: PendingSubmit = {
    resolve: () => undefined,
    reject: () => undefined,
    progress: () => undefined,
  };
  mockedSubmit.mockImplementation(
    (_courseId, _labId, _file, _comment, onProgress) =>
      new Promise<LabSubmission>((resolve, reject) => {
        pending.resolve = resolve;
        pending.reject = reject;
        pending.progress = (percent): void => {
          onProgress?.(percent);
        };
      }),
  );
  return pending;
}

// работа после отправки: на проверке, третья попытка ждёт ответа
function createSubmittedThirdAttempt(): LabSubmission {
  const data = structuredClone(labSubmissionFixture);
  const submittedAt = toIsoDateTime('2026-10-24T16:40:00+03:00');
  data.lab = {
    ...data.lab,
    status: LabStatus.PendingReview,
    variant: 42,
    submittedAt,
  };
  data.attempts.push({
    id: 24,
    number: 3,
    submittedAt,
    file: { name: 'otchet_v3.pdf', size: 2_516_582 },
    comment: 'Исправил формы.',
    teacherComment: null,
    result: AttemptResult.Pending,
  });
  return data;
}

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

// файл в 2,4 МБ: содержимое не важно, размер задаём явно
const selectedFile = new File(['%PDF'], 'otchet_v3.pdf');
Object.defineProperty(selectedFile, 'size', { value: 2_516_582 });

// выбор в окне: в jsdom список файлов поля задаётся подменой свойства
async function chooseFile(
  wrapper: ReturnType<typeof mount>,
  file: File,
): Promise<void> {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, 'files', {
    value: [file],
    configurable: true,
  });
  await input.trigger('change');
}

async function mountWithFile(): Promise<ReturnType<typeof mount>> {
  const wrapper = mountPage();
  await flushPromises();
  await chooseFile(wrapper, selectedFile);
  return wrapper;
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
    mockedSubmit.mockReset();
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

  describe('выбор файла', () => {
    it('выбранный файл показывается карточкой вместо области', async () => {
      const wrapper = await mountWithFile();
      const card = wrapper.find('.submitted-file-card');

      expect(wrapper.find('.file-dropzone').exists()).toBe(false);
      expect(card.text()).toContain('otchet_v3.pdf');
      expect(card.find('.submitted-file-card__details').text()).toBe('2,4 МБ');
      expect(card.find('.submitted-file-card__type').text()).toBe('PDF');
    });

    it('с выбранным файлом работу можно отправить', async () => {
      const wrapper = await mountWithFile();

      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeUndefined();
    });

    it('«Удалить файл» возвращает область и снова блокирует отправку', async () => {
      const wrapper = await mountWithFile();

      await wrapper.find('.submitted-file-card__remove').trigger('click');

      expect(wrapper.find('.submitted-file-card').exists()).toBe(false);
      expect(wrapper.find('.file-dropzone').exists()).toBe(true);
      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeDefined();
    });

    it('при переходе к другой работе файл и комментарий сбрасываются', async () => {
      const wrapper = await mountWithFile();
      await wrapper.find('textarea').setValue('Исправил формы.');

      await wrapper.setProps({ courseId: 11, labId: 4 });
      await flushPromises();

      expect(wrapper.find('.file-dropzone').exists()).toBe(true);
      expect(
        (wrapper.find('textarea').element as HTMLTextAreaElement).value,
      ).toBe('');
    });
  });

  describe('проверка файла', () => {
    it('файл другого типа не принимает и объясняет почему', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await chooseFile(wrapper, new File(['MZ'], 'setup.exe'));

      expect(wrapper.find('.lab-submission-page__file-error').text()).toBe(
        'Этот тип файла не принимается. Можно: PDF, ZIP, IPYNB, PY, JAVA',
      );
      expect(wrapper.find('.submitted-file-card').exists()).toBe(false);
      expect(wrapper.find('.file-dropzone').exists()).toBe(true);
      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeDefined();
    });

    it('слишком большой файл не принимает', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const bigFile = new File(['PK'], 'project.zip');
      Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 });

      await chooseFile(wrapper, bigFile);

      expect(wrapper.find('.lab-submission-page__file-error').text()).toBe(
        'Файл больше 20 МБ',
      );
      expect(wrapper.find('.submitted-file-card').exists()).toBe(false);
    });

    it('пустой файл не принимает', async () => {
      const wrapper = mountPage();
      await flushPromises();

      await chooseFile(wrapper, new File([], 'otchet.pdf'));

      expect(wrapper.find('.lab-submission-page__file-error').text()).toBe(
        'Файл пустой',
      );
      expect(wrapper.find('.submitted-file-card').exists()).toBe(false);
    });

    it('после подходящего файла ошибка пропадает', async () => {
      const wrapper = mountPage();
      await flushPromises();
      await chooseFile(wrapper, new File(['MZ'], 'setup.exe'));

      await chooseFile(wrapper, selectedFile);

      expect(wrapper.find('.lab-submission-page__file-error').exists()).toBe(
        false,
      );
      expect(wrapper.find('.submitted-file-card').text()).toContain(
        'otchet_v3.pdf',
      );
    });
  });

  describe('отправка', () => {
    it('отправляет выбранный файл и комментарий без лишних пробелов', async () => {
      createPendingSubmit();
      const wrapper = await mountWithFile();
      await wrapper.find('textarea').setValue('  Исправил формы.  ');

      await wrapper.find('form').trigger('submit');

      expect(mockedSubmit).toHaveBeenCalledWith(
        11,
        2,
        selectedFile,
        'Исправил формы.',
        expect.any(Function),
        expect.any(AbortSignal),
      );
    });

    it('пустой комментарий не отправляет', async () => {
      createPendingSubmit();
      const wrapper = await mountWithFile();
      await wrapper.find('textarea').setValue('   ');

      await wrapper.find('form').trigger('submit');

      expect(mockedSubmit.mock.calls[0]?.[3]).toBeNull();
    });

    it('во время загрузки показывает прогресс и блокирует форму', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      pending.progress(40);
      await flushPromises();

      expect(wrapper.find('.lab-submission-page__upload-label').text()).toBe(
        'Загрузка файла… 40%',
      );
      expect(
        wrapper.find('[role="progressbar"]').attributes('aria-valuenow'),
      ).toBe('40');
      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeDefined();
      expect(wrapper.find('textarea').attributes('disabled')).toBeDefined();
      expect(wrapper.find('.submitted-file-card__remove').exists()).toBe(false);
      const draft = wrapper
        .findAll('button')
        .find((button) => button.text() === 'Сохранить черновик');
      expect(draft?.attributes('disabled')).toBeDefined();
    });

    it('«Отменить загрузку» прерывает отправку, а файл и комментарий остаются', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();
      await wrapper.find('textarea').setValue('Исправил формы.');
      await wrapper.find('form').trigger('submit');
      pending.progress(40);
      await flushPromises();

      const cancelButton = wrapper
        .findAll('button')
        .find((button) => button.text() === 'Отменить загрузку');
      await cancelButton?.trigger('click');
      await flushPromises();

      const signal = mockedSubmit.mock.calls[0]?.[5];
      expect(signal?.aborted).toBe(true);
      expect(wrapper.find('.lab-submission-page__upload').exists()).toBe(false);
      expect(wrapper.find('.submitted-file-card').text()).toContain(
        'otchet_v3.pdf',
      );
      expect(
        (wrapper.find('textarea').element as HTMLTextAreaElement).value,
      ).toBe('Исправил формы.');
      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeUndefined();
      expect(wrapper.find('.lab-submission-page__submit-error').exists()).toBe(
        false,
      );
      expect(wrapper.find('.lab-status-bar').text()).toBe('Не сдано');
    });

    it('пока файл загружается, второй раз работу не отправить', async () => {
      createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      await wrapper.find('form').trigger('submit');

      expect(mockedSubmit).toHaveBeenCalledTimes(1);
    });

    it('после отправки работа на проверке, а попытка — сверху истории', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      pending.resolve(createSubmittedThirdAttempt());
      await flushPromises();

      expect(wrapper.find('.lab-status-bar').text()).toBe('На проверке');
      expect(wrapper.find('form').exists()).toBe(false);
      expect(wrapper.find('.submitted-file-card').text()).toContain(
        'otchet_v3.pdf',
      );
      expect(wrapper.find('.lab-submission-page__note').text()).toBe(
        'Ваш комментарий: Исправил формы.',
      );
      const attempts = wrapper.findAll('.lab-attempt-card');
      expect(attempts).toHaveLength(3);
      expect(attempts[0]?.find('h3').text()).toBe('Попытка 3 — 24.10.2026');
      expect(attempts[0]?.find('.lab-attempt-card__result').text()).toBe(
        'На проверке',
      );
    });

    it('если отправить не удалось, показывает ошибку и оставляет файл', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      pending.reject(new ApiRequestError(503, 'Сервис временно недоступен'));
      await flushPromises();

      expect(wrapper.find('.lab-submission-page__submit-error').text()).toBe(
        'Не удалось отправить работу: Сервис временно недоступен',
      );
      expect(wrapper.find('.submitted-file-card').text()).toContain(
        'otchet_v3.pdf',
      );
      expect(
        wrapper.find('button[type="submit"]').attributes('disabled'),
      ).toBeUndefined();
    });

    it('«Повторить отправку» отправляет тот же файл ещё раз', async () => {
      mockedSubmit.mockRejectedValueOnce(
        new ApiRequestError(500, 'Загрузка файла прервалась'),
      );
      const wrapper = await mountWithFile();
      await wrapper.find('textarea').setValue('Исправил формы.');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      mockedSubmit.mockResolvedValueOnce(createSubmittedThirdAttempt());
      await wrapper
        .find('button[aria-label="Повторить отправку"]')
        .trigger('click');
      await flushPromises();

      expect(mockedSubmit).toHaveBeenCalledTimes(2);
      expect(mockedSubmit.mock.calls[1]?.slice(0, 4)).toEqual([
        11,
        2,
        selectedFile,
        'Исправил формы.',
      ]);
      expect(wrapper.find('.lab-status-bar').text()).toBe('На проверке');
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('если убрать файл после ошибки, ошибка пропадает', async () => {
      mockedSubmit.mockRejectedValueOnce(new ApiRequestError(500, 'Сбой'));
      const wrapper = await mountWithFile();
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      await wrapper.find('.submitted-file-card__remove').trigger('click');

      expect(wrapper.find('.lab-submission-page__submit-error').exists()).toBe(
        false,
      );
    });

    it('если во время загрузки открыть другую работу, её форма свободна', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      pending.progress(40);
      await wrapper.setProps({ courseId: 11, labId: 4 });
      await flushPromises();
      pending.progress(80);
      pending.reject(new ApiRequestError(500, 'Загрузка файла прервалась'));
      await flushPromises();

      expect(wrapper.find('.lab-submission-page__upload').exists()).toBe(false);
      expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined();
      expect(wrapper.find('.lab-submission-page__submit-error').exists()).toBe(
        false,
      );
    });

    it('ответ на отправку прошлой работы не заменяет открытую', async () => {
      const pending = createPendingSubmit();
      const wrapper = await mountWithFile();

      await wrapper.find('form').trigger('submit');
      await wrapper.setProps({ courseId: 11, labId: 4 });
      await flushPromises();
      pending.resolve(createSubmittedThirdAttempt());
      await flushPromises();

      expect(wrapper.find('.lab-status-bar').text()).toBe('Не сдано');
      expect(wrapper.findAll('.lab-attempt-card')).toHaveLength(2);
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
