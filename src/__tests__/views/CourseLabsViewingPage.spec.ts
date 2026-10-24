import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { nextTick, ref } from 'vue';
import { routerKey } from 'vue-router';
import type { LocationQuery } from 'vue-router';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import CourseLabsViewingPage from '@/views/CourseLabsViewingPage.vue';
import { getCourseLabsStub } from '@/api/labs/LabsApi.ts';
import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import type { Lab } from '@/api/labs/Lab.dto.ts';
import type { IsoDateTime } from '@/types/IsoDateTime.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';
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

// работа без оценки и даты сдачи. У несданной вариант — её номер, умноженный на 10
function createLab(
  number: number,
  status: typeof LabStatus.NotSubmitted | typeof LabStatus.Locked,
): Lab {
  const base = {
    id: number,
    number,
    title: `Работа ${String(number)}`,
    deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
  };

  return status === LabStatus.NotSubmitted
    ? { ...base, status, variant: number * 10 }
    : { ...base, status };
}

function createCourseLabs(id: number, title: string): CourseLabs {
  const data = structuredClone(courseLabsFixture);
  data.course = { ...data.course, id, title };

  return data;
}

// роутер нужен странице только чтобы записать выбранную работу в адрес
const routerReplace = vi.fn();
const currentQuery = ref<LocationQuery>({});

async function mountPage(
  courseId = 11,
  labId: number | null = null,
): Promise<ReturnType<typeof mount>> {
  const wrapper = mount(CourseLabsViewingPage, {
    props: { courseId, labId },
    global: {
      stubs: { RouterLink: RouterLinkStub },
      provide: {
        [routerKey as symbol]: {
          currentRoute: ref({ query: currentQuery }),
          replace: routerReplace,
        },
      },
    },
  });
  await flushPromises();

  return wrapper;
}

function setNow(date: string): void {
  vi.setSystemTime(new Date(date));
}

// переводит часы и ждёт очередного обновления времени на открытой странице
async function moveTimeTo(date: string): Promise<void> {
  setNow(date);
  vi.advanceTimersByTime(60 * 1000);
  await nextTick();
}

describe('CourseLabsViewingPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentQuery.value = {};
    mockedGetCourseLabs.mockResolvedValue(structuredClone(courseLabsFixture));
    // подменяем дату и интервал обновления времени; остальные таймеры нужны
    // flushPromises
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    // срок активной работы в фикстуре - 15 октября, 23:59
    setNow('2026-10-02T12:00:00+03:00');
  });

  afterEach(() => {
    vi.useRealTimers();
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

      expect(card.find('.active-lab-card__title').text()).toBe('Работа Б');
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
      ).toEqual(['Сдано', 'Не сдано', 'Недоступно']);
    });

    it('для недоступной работы называет ближайшую предыдущую из списка', async () => {
      // работы №3 нет, список не отсортирован
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        labs: [
          createLab(4, LabStatus.Locked),
          createLab(1, LabStatus.NotSubmitted),
          createLab(2, LabStatus.NotSubmitted),
        ],
      });
      const wrapper = await mountPage();

      expect(
        wrapper.find('.lab-list-item .lab-list-item__details').text(),
      ).toBe('Откроется после лабораторной №2');
    });

    it('для самой ранней недоступной работы пишет «Пока недоступна»', async () => {
      // работы №1 нет, недоступная работа — самая ранняя в списке
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        labs: [
          createLab(2, LabStatus.Locked),
          createLab(3, LabStatus.NotSubmitted),
        ],
      });
      const wrapper = await mountPage();

      expect(
        wrapper.find('.lab-list-item .lab-list-item__details').text(),
      ).toBe('Пока недоступна');
    });

    it('работу на проверке показывает отдельно и не считает выполненной', async () => {
      const data = structuredClone(courseLabsFixture);
      data.labs = data.labs.map((lab) =>
        lab.status === LabStatus.NotSubmitted
          ? {
              ...lab,
              status: LabStatus.PendingReview,
              submittedAt: toIsoDateTime('2026-10-14T18:30:00+03:00'),
            }
          : lab,
      );
      mockedGetCourseLabs.mockResolvedValue(data);
      const wrapper = await mountPage();
      const items = wrapper.findAll('.lab-list-item');

      expect(
        items.map((item) => item.find('.lab-status-badge').text()),
      ).toEqual(['Сдано', 'На проверке', 'Недоступно']);
      expect(items[1]?.find('.lab-list-item__details').text()).toBe(
        'Сдано 14 октября · ждёт оценки',
      );
      expect(wrapper.find('.course-labs-page__progress').text()).toBe(
        '1 из 3 выполнено',
      );
    });

    it('без доступных для выбора работ показывает «Активных работ нет»', async () => {
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        labs: [createLab(1, LabStatus.Locked), createLab(2, LabStatus.Locked)],
      });
      const wrapper = await mountPage();

      expect(wrapper.find('.course-labs-page__empty').text()).toBe(
        'Активных работ нет.',
      );
      expect(wrapper.find('.active-lab-card').exists()).toBe(false);
      expect(wrapper.findAll('.lab-list-item')).toHaveLength(2);
    });
  });

  // одна карточка; какую работу в ней показать, студент выбирает в списке
  describe('выбор работы', () => {
    function deadline(date: string): IsoDateTime {
      return toIsoDateTime(`${date}T23:59:00+03:00`);
    }

    // сегодня 2 октября: у работы 3 ближайший срок, у работы 4 срок уже прошёл
    function createSelectionLabs(): Lab[] {
      return [
        {
          id: 1,
          number: 1,
          title: 'Работа 1',
          status: LabStatus.Submitted,
          deadline: deadline('2026-09-20'),
          variant: 10,
          grade: 5,
          submittedAt: deadline('2026-09-19'),
        },
        {
          id: 2,
          number: 2,
          title: 'Работа 2',
          status: LabStatus.NotSubmitted,
          deadline: deadline('2026-10-20'),
          variant: 20,
        },
        {
          id: 3,
          number: 3,
          title: 'Работа 3',
          status: LabStatus.NotSubmitted,
          deadline: deadline('2026-10-10'),
          variant: 30,
        },
        {
          id: 4,
          number: 4,
          title: 'Работа 4',
          status: LabStatus.NotSubmitted,
          deadline: deadline('2026-09-30'),
          variant: 40,
        },
        createLab(5, LabStatus.Locked),
        {
          id: 6,
          number: 6,
          title: 'Работа 6',
          status: LabStatus.PendingReview,
          deadline: deadline('2026-09-28'),
          variant: 60,
          submittedAt: deadline('2026-09-27'),
        },
      ];
    }

    async function mountWithSelectionLabs(
      labId: number | null = null,
    ): Promise<ReturnType<typeof mount>> {
      mockedGetCourseLabs.mockResolvedValue({
        ...structuredClone(courseLabsFixture),
        labs: createSelectionLabs(),
      });

      return mountPage(11, labId);
    }

    function cardTitle(wrapper: ReturnType<typeof mount>): string {
      return wrapper.find('.active-lab-card__title').text();
    }

    function selectButton(
      wrapper: ReturnType<typeof mount>,
      number: number,
    ): ReturnType<ReturnType<typeof mount>['find']> | undefined {
      return wrapper
        .findAll('.lab-list-item__select')
        .find((button) => button.text().startsWith(`Лаб №${String(number)}:`));
    }

    it('показывает одну карточку — несданную работу с ближайшим сроком', async () => {
      const wrapper = await mountWithSelectionLabs();

      expect(wrapper.findAll('.active-lab-card')).toHaveLength(1);
      expect(cardTitle(wrapper)).toBe('Работа 3');
      expect(selectButton(wrapper, 3)?.attributes('aria-pressed')).toBe('true');
    });

    it('по нажатию на работу в списке открывает её в карточке и запоминает в адресе', async () => {
      const wrapper = await mountWithSelectionLabs();

      await selectButton(wrapper, 2)?.trigger('click');

      expect(cardTitle(wrapper)).toBe('Работа 2');
      expect(wrapper.find('.active-lab-card__variant-value').text()).toBe('20');
      expect(selectButton(wrapper, 2)?.attributes('aria-pressed')).toBe('true');
      expect(selectButton(wrapper, 3)?.attributes('aria-pressed')).toBe(
        'false',
      );
      expect(routerReplace).toHaveBeenCalledWith({ query: { lab: '2' } });
    });

    it('сохраняет остальные параметры адреса', async () => {
      currentQuery.value = { mock: 'empty', role: 'student' };
      const wrapper = await mountWithSelectionLabs();

      await selectButton(wrapper, 2)?.trigger('click');

      expect(routerReplace).toHaveBeenCalledWith({
        query: { mock: 'empty', role: 'student', lab: '2' },
      });
    });

    it('открывает несданную работу с прошедшим сроком', async () => {
      const wrapper = await mountWithSelectionLabs();

      await selectButton(wrapper, 4)?.trigger('click');

      expect(cardTitle(wrapper)).toBe('Работа 4');
      expect(wrapper.find('.active-lab-card__deadline').text()).toBe(
        'Срок истёк 30 сентября, 23:59',
      );
    });

    it('открывает сданную работу и работу на проверке — со статусом вместо срока', async () => {
      const wrapper = await mountWithSelectionLabs();

      await selectButton(wrapper, 1)?.trigger('click');
      expect(cardTitle(wrapper)).toBe('Работа 1');
      expect(wrapper.find('.active-lab-card__deadline').exists()).toBe(false);
      expect(wrapper.find('.active-lab-card .lab-status-badge').text()).toBe(
        'Сдано',
      );

      await selectButton(wrapper, 6)?.trigger('click');
      expect(cardTitle(wrapper)).toBe('Работа 6');
      expect(wrapper.find('.active-lab-card .lab-status-badge').text()).toBe(
        'На проверке',
      );
    });

    it('недоступную работу выбрать нельзя', async () => {
      const wrapper = await mountWithSelectionLabs();
      const lockedItem = wrapper
        .findAll('.lab-list-item')
        .find((item) => item.text().includes('Лаб №5:'));

      expect(selectButton(wrapper, 5)).toBeUndefined();
      expect(lockedItem?.classes()).not.toContain('lab-list-item--selectable');

      await lockedItem?.trigger('click');

      expect(cardTitle(wrapper)).toBe('Работа 3');
      expect(routerReplace).not.toHaveBeenCalled();
    });

    it('открывает работу из адреса', async () => {
      const wrapper = await mountWithSelectionLabs(6);

      expect(cardTitle(wrapper)).toBe('Работа 6');
    });

    it.each([
      ['недоступна', 5],
      ['не существует', 999],
    ])(
      'если работа из адреса %s, открывает работу по умолчанию',
      async (_, labId) => {
        const wrapper = await mountWithSelectionLabs(labId);

        expect(cardTitle(wrapper)).toBe('Работа 3');
      },
    );

    it('при смене работы в адресе обновляет карточку', async () => {
      const wrapper = await mountWithSelectionLabs();

      await wrapper.setProps({ labId: 4 });

      expect(cardTitle(wrapper)).toBe('Работа 4');
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

  describe('срок сдачи', () => {
    it('за три и более суток до срока показывает его обычным цветом', async () => {
      const wrapper = await mountPage();
      const deadline = wrapper.find('.active-lab-card__deadline');

      expect(deadline.text()).toBe('До 15 октября, 23:59');
      expect(deadline.classes()).not.toContain(
        'active-lab-card__deadline--urgent',
      );
    });

    it('меньше чем за трое суток до срока выделяет его', async () => {
      setNow('2026-10-14T10:00:00+03:00');
      const wrapper = await mountPage();
      const deadline = wrapper.find('.active-lab-card__deadline');

      expect(deadline.text()).toBe('До 15 октября, 23:59');
      expect(deadline.classes()).toContain('active-lab-card__deadline--urgent');
    });

    it('после срока пишет «Срок истёк» и выделяет его', async () => {
      setNow('2026-10-16T09:00:00+03:00');
      const wrapper = await mountPage();
      const deadline = wrapper.find('.active-lab-card__deadline');

      expect(deadline.text()).toBe('Срок истёк 15 октября, 23:59');
      expect(deadline.classes()).toContain('active-lab-card__deadline--urgent');
    });

    it('в списке выделяет срок несданной работы, только когда он близко', async () => {
      const urgentDetails = (wrapper: ReturnType<typeof mount>): string[] =>
        wrapper
          .findAll('.lab-list-item__details--urgent')
          .map((details) => details.text());

      const farWrapper = await mountPage();
      expect(urgentDetails(farWrapper)).toEqual([]);

      setNow('2026-10-14T10:00:00+03:00');
      const soonWrapper = await mountPage();
      expect(urgentDetails(soonWrapper)).toEqual(['Дедлайн 15 октября']);
    });

    it('в списке у несданной работы после срока пишет «Срок истёк»', async () => {
      setNow('2026-10-16T09:00:00+03:00');
      const wrapper = await mountPage();

      expect(
        wrapper
          .findAll('.lab-list-item__details')
          .map((details) => details.text()),
      ).toEqual([
        'Оценка 4,2 · сдано 12 октября',
        'Срок истёк 15 октября',
        'Откроется после лабораторной №2',
      ]);
      expect(
        wrapper.findAll('.lab-list-item__details--urgent').map((d) => d.text()),
      ).toEqual(['Срок истёк 15 октября']);
    });

    it('обновляет срок на открытой странице без перезагрузки', async () => {
      setNow('2026-10-12T12:00:00+03:00');
      const wrapper = await mountPage();
      const cardDeadline = wrapper.find('.active-lab-card__deadline');
      const urgentInList = (): string[] =>
        wrapper
          .findAll('.lab-list-item__details--urgent')
          .map((details) => details.text());

      expect(cardDeadline.classes()).not.toContain(
        'active-lab-card__deadline--urgent',
      );
      expect(urgentInList()).toEqual([]);

      await moveTimeTo('2026-10-13T12:00:00+03:00');

      expect(cardDeadline.text()).toBe('До 15 октября, 23:59');
      expect(cardDeadline.classes()).toContain(
        'active-lab-card__deadline--urgent',
      );
      expect(urgentInList()).toEqual(['Дедлайн 15 октября']);

      await moveTimeTo('2026-10-16T00:00:00+03:00');

      expect(cardDeadline.text()).toBe('Срок истёк 15 октября, 23:59');
      expect(urgentInList()).toEqual(['Срок истёк 15 октября']);
      // страница та же: данные не запрашивались заново
      expect(mockedGetCourseLabs).toHaveBeenCalledTimes(1);
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
