import { beforeEach, describe, expect, it, vi } from 'vitest';

import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import CourseLabsViewingPage from '@/views/CourseLabsViewingPage.vue';
import { getCourseLabsStub } from '@/api/labs/LabsApi.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { courseLabsFixture } from '../fixtures.ts';

vi.mock('@/api/labs/LabsApi.ts', () => ({ getCourseLabsStub: vi.fn() }));

const mockedGetCourseLabs = vi.mocked(getCourseLabsStub);

interface PendingRequest {
  promise: Promise<CourseLabs>;
  resolve: (data: CourseLabs) => void;
  reject: (error: unknown) => void;
}

// запрос, который завершается вручную: так задаётся порядок ответов
function createPendingRequest(): PendingRequest {
  let resolve: PendingRequest['resolve'] = () => undefined;
  let reject: PendingRequest['reject'] = () => undefined;
  const promise = new Promise<CourseLabs>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });

  return { promise, resolve, reject };
}

function createCourseLabs(id: number, title: string): CourseLabs {
  const data = structuredClone(courseLabsFixture);
  data.course = { ...data.course, id, title };

  return data;
}

async function mountPage(courseId = 11): Promise<ReturnType<typeof mount>> {
  const wrapper = mount(CourseLabsViewingPage, {
    props: { courseId },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  });
  await flushPromises();

  return wrapper;
}

describe('CourseLabsViewingPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetCourseLabs.mockResolvedValue(structuredClone(courseLabsFixture));
  });

  // загрузка, ошибка, пустой список
  describe('состояния загрузки', () => {
    it('пока данные загружаются, показывает сообщение о загрузке', async () => {
      mockedGetCourseLabs.mockReturnValue(new Promise(() => undefined));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка лабораторных работ…',
      );
      expect(wrapper.find('.lab-list-item').exists()).toBe(false);
    });

    it('при ошибке показывает её текст и кнопку «Повторить»', async () => {
      mockedGetCourseLabs.mockRejectedValue(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"] span').text()).toBe(
        'Не удалось загрузить лабораторные работы: Сервис временно недоступен',
      );
      expect(
        wrapper.find('.course-labs-page__retry').attributes('aria-label'),
      ).toBe('Повторить');
      expect(wrapper.find('.lab-list-item').exists()).toBe(false);
    });

    it('после «Повторить» загружает данные заново', async () => {
      mockedGetCourseLabs.mockRejectedValueOnce(
        new ApiRequestError(503, 'Сервис временно недоступен'),
      );
      const wrapper = await mountPage();

      await wrapper.find('.course-labs-page__retry').trigger('click');
      await flushPromises();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.findAll('.lab-list-item')).toHaveLength(3);
    });

    it('для ошибки не из ApiResolver показывает общее сообщение без повтора', async () => {
      mockedGetCourseLabs.mockRejectedValue(new Error('boom'));
      const wrapper = await mountPage();

      expect(wrapper.find('[role="alert"] span').text()).toBe(
        'Не удалось загрузить лабораторные работы: Неизвестная ошибка',
      );
    });

    it('без лабораторных показывает «Лабораторных работ пока нет»', async () => {
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        activeLab: null,
        labs: [],
      });
      const wrapper = await mountPage();

      expect(wrapper.find('.course-labs-page__empty').text()).toBe(
        'Лабораторных работ пока нет.',
      );
      expect(wrapper.find('.course-labs-page__progress').exists()).toBe(false);
      expect(wrapper.find('.active-lab-card').exists()).toBe(false);
    });
  });

  describe('загруженные данные', () => {
    it('запрашивает лабораторные нужной дисциплины', async () => {
      await mountPage(11);
      expect(mockedGetCourseLabs).toHaveBeenCalledWith(11);
    });

    it('показывает название дисциплины и прогресс', async () => {
      const wrapper = await mountPage();

      expect(wrapper.find('h1').text()).toBe('Курс А');
      expect(wrapper.find('.course-labs-page__progress').text()).toBe(
        '1 из 3 выполнено',
      );
    });

    it('ведёт кнопкой «назад» к списку дисциплин', async () => {
      const wrapper = await mountPage();
      expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
        name: 'courses',
      });
    });

    it('показывает активную работу со сроком сдачи', async () => {
      const wrapper = await mountPage();
      const card = wrapper.find('.active-lab-card');

      expect(card.find('.active-lab-card__title').text()).toBe(
        'Работа Б полностью',
      );
      expect(card.find('.active-lab-card__deadline').text()).toBe(
        'До 15 октября, 23:59',
      );
    });

    it('показывает все работы с подписями и статусами', async () => {
      const wrapper = await mountPage();
      const items = wrapper.findAll('.lab-list-item');

      expect(items.map((item) => item.find('h3').text())).toEqual([
        'Лаб №1: Работа А',
        'Лаб №2: Работа Б',
        'Лаб №3: Работа В',
      ]);
      expect(
        items.map((item) => item.find('.lab-list-item__details').text()),
      ).toEqual([
        'Оценка 4,2 · сдано 12 октября',
        'Дедлайн 15 октября',
        'Откроется после лабораторной №2',
      ]);
      expect(
        items.map((item) => item.find('.lab-status-badge').text()),
      ).toEqual(['Сдано', 'Не сдано', 'Заблокировано']);
    });

    it('без активной работы показывает «Активных работ нет»', async () => {
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        activeLab: null,
      });
      const wrapper = await mountPage();

      expect(wrapper.find('.course-labs-page__empty').text()).toBe(
        'Активных работ нет.',
      );
      expect(wrapper.findAll('.lab-list-item')).toHaveLength(3);
    });
  });

  describe('активная работа', () => {
    it('сразу показывает выданный вариант', async () => {
      const wrapper = await mountPage();
      expect(wrapper.find('.active-lab-card__variant-value').text()).toBe('42');
    });

    it('кнопки «Получить вариант» и «Открыть задание» доступны', async () => {
      const wrapper = await mountPage();
      const buttons = wrapper.findAll('.active-lab-card__button');

      expect(buttons.map((button) => button.text())).toEqual([
        'Получить вариант',
        'Открыть задание',
      ]);
      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeUndefined();
      });
    });

    it('«Получить вариант» ничего не запрашивает и не меняет страницу', async () => {
      const wrapper = await mountPage();
      const html = wrapper.html();

      await wrapper.find('.active-lab-card__button--primary').trigger('click');
      await flushPromises();

      expect(mockedGetCourseLabs).toHaveBeenCalledTimes(1);
      expect(wrapper.html()).toBe(html);
    });
  });

  // ответ на запрос прежней дисциплины не должен перезаписать новую
  describe('смена дисциплины', () => {
    let oldRequest: PendingRequest;
    let newRequest: PendingRequest;

    async function switchCourse(): Promise<ReturnType<typeof mount>> {
      oldRequest = createPendingRequest();
      newRequest = createPendingRequest();
      mockedGetCourseLabs
        .mockReturnValueOnce(oldRequest.promise)
        .mockReturnValueOnce(newRequest.promise);

      const wrapper = await mountPage(11);
      await wrapper.setProps({ courseId: 12 });

      return wrapper;
    }

    it('запрашивает лабораторные новой дисциплины', async () => {
      await switchCourse();

      expect(mockedGetCourseLabs).toHaveBeenNthCalledWith(1, 11);
      expect(mockedGetCourseLabs).toHaveBeenNthCalledWith(2, 12);
    });

    it('показывает новую дисциплину, даже если ответ для прежней пришёл позже', async () => {
      const wrapper = await switchCourse();

      newRequest.resolve(createCourseLabs(12, 'Курс Б'));
      await flushPromises();
      oldRequest.resolve(createCourseLabs(11, 'Курс А'));
      await flushPromises();

      expect(wrapper.find('h1').text()).toBe('Курс Б');
      expect(wrapper.find('[role="status"]').exists()).toBe(false);
    });

    it('не завершает загрузку ответом для прежней дисциплины', async () => {
      const wrapper = await switchCourse();

      oldRequest.resolve(createCourseLabs(11, 'Курс А'));
      await flushPromises();

      expect(wrapper.find('[role="status"]').text()).toBe(
        'Загрузка лабораторных работ…',
      );
      expect(wrapper.find('h1').exists()).toBe(false);

      newRequest.resolve(createCourseLabs(12, 'Курс Б'));
      await flushPromises();

      expect(wrapper.find('h1').text()).toBe('Курс Б');
    });

    it('не показывает ошибку запроса для прежней дисциплины', async () => {
      const wrapper = await switchCourse();

      newRequest.resolve(createCourseLabs(12, 'Курс Б'));
      await flushPromises();
      oldRequest.reject(new ApiRequestError(503, 'Сервис временно недоступен'));
      await flushPromises();

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.find('h1').text()).toBe('Курс Б');
    });
  });
});
