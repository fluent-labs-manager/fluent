import { afterEach, describe, expect, it } from 'vitest';

import { flushPromises, mount } from '@vue/test-utils';
import GradebookPreview from '@/components/GradebookPreview.vue';
import type { StudentGroup } from '@/api/gradebook/StudentGroup.dto.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import type { SectionSummary } from '@/types/SectionSummary.ts';
import { courseGradebookFixture } from '../fixtures.ts';

const groups: StudentGroup[] = courseGradebookFixture.groups;

function createSection(
  section: SectionSummary['section'],
  title: string,
  works: SectionSummary['works'],
): SectionSummary {
  return {
    section,
    title,
    limit: 20,
    score: works.reduce((sum, work) => sum + work.maxScore, 0),
    isOverLimit: false,
    works,
  };
}

const sections: SectionSummary[] = [
  createSection(BarsSection.ClassWork, 'Работа на занятиях', []),
  createSection(BarsSection.Labs, 'Лабораторные работы', [
    { id: 1, title: 'ЛР1', maxScore: 10, section: BarsSection.Labs },
    { id: 2, title: 'ЛР2', maxScore: 15, section: BarsSection.Labs },
  ]),
  createSection(BarsSection.Exam, 'Экзамен', [
    { id: 3, title: 'Экзамен', maxScore: 20, section: BarsSection.Exam },
  ]),
];

function mountPreview(
  props: Partial<{
    groups: StudentGroup[];
    sections: SectionSummary[];
    admissionThreshold: number;
  }> = {},
): ReturnType<typeof mount> {
  return mount(GradebookPreview, {
    props: { groups, sections, admissionThreshold: 60, ...props },
    attachTo: document.body,
  });
}

function headerRows(wrapper: ReturnType<typeof mount>): string[][] {
  return wrapper
    .findAll('thead tr')
    .map((row) =>
      row.findAll('th').map((cell) => cell.text().replace(/\s+/g, ' ')),
    );
}

describe('GradebookPreview', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('по вкладке на группу, открыта первая', () => {
    const wrapper = mountPreview();
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs.map((tab) => tab.text())).toEqual(['P0001', 'P0002']);
    expect(tabs.map((tab) => tab.attributes('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    // в ряд вкладок попадают по Tab только на выбранную, дальше — стрелками
    expect(tabs.map((tab) => tab.attributes('tabindex'))).toEqual(['0', '-1']);
    expect(wrapper.find('caption').text()).toBe('Группа P0001 · 2 студента');
  });

  it('панель связана с выбранной вкладкой', () => {
    const wrapper = mountPreview();
    const tab = wrapper.find('[role="tab"]');
    const panel = wrapper.find('[role="tabpanel"]');

    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'));
    expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'));
  });

  it('шапка: разделы над своими работами, пустые разделы не попадают', () => {
    const wrapper = mountPreview();

    expect(headerRows(wrapper)).toEqual([
      [
        'ФИО',
        'ИСУ',
        'Поток',
        'Лабораторные работы',
        'Экзамен',
        'Итог сумма',
        'Допуск от 60 баллов',
      ],
      ['ЛР1 из 10', 'ЛР2 из 15', 'Экзамен из 20'],
    ]);
    const sectionCells = wrapper.findAll('th[scope="colgroup"]');
    expect(sectionCells.map((cell) => cell.attributes('colspan'))).toEqual([
      '2',
      '1',
    ]);
  });

  it('строки — студенты группы с пустыми ячейками под баллы', () => {
    const wrapper = mountPreview();
    const rows = wrapper.findAll('tbody tr');

    expect(rows).toHaveLength(2);
    expect(rows[0]?.find('th[scope="row"]').text()).toBe('Студент Первый');
    const cells = rows[0]?.findAll('td') ?? [];
    expect(cells.slice(0, 2).map((cell) => cell.text())).toEqual([
      '100001',
      'Поток 1',
    ]);
    // три работы, итог и допуск
    expect(cells.slice(2).map((cell) => cell.text())).toEqual([
      '',
      '',
      '',
      '',
      '',
    ]);
  });

  it('по нажатию открывает вкладку другой группы', async () => {
    const wrapper = mountPreview();

    await wrapper.findAll('[role="tab"]')[1]?.trigger('click');

    expect(wrapper.find('caption').text()).toBe('Группа P0002 · 1 студент');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });

  it.each([
    ['ArrowRight', 0, 'P0002'],
    ['ArrowRight', 1, 'P0001'],
    ['ArrowLeft', 0, 'P0002'],
    ['End', 0, 'P0002'],
    ['Home', 1, 'P0001'],
  ])(
    'клавиша %s со вкладки %i открывает %s и переводит на неё фокус',
    async (key, from, expected) => {
      const wrapper = mountPreview();
      await wrapper.findAll('[role="tab"]')[from]?.trigger('click');

      await wrapper.findAll('[role="tab"]')[from]?.trigger('keydown', { key });
      await flushPromises();

      const active = wrapper.find('[aria-selected="true"]');
      expect(active.text()).toBe(expected);
      expect(document.activeElement).toBe(active.element);
    },
  );

  it('если открытую группу убрали, открыта первая из оставшихся', async () => {
    const wrapper = mountPreview();
    await wrapper.findAll('[role="tab"]')[1]?.trigger('click');

    await wrapper.setProps({ groups: groups.slice(0, 1) });

    expect(wrapper.find('[aria-selected="true"]').text()).toBe('P0001');
  });

  it('порог допуска берёт из конструктора', () => {
    const wrapper = mountPreview({ admissionThreshold: 55 });

    expect(wrapper.find('thead').text()).toContain('от 55 баллов');
  });

  it('без разложенных работ подсказывает, откуда возьмутся колонки', () => {
    const wrapper = mountPreview({
      sections: sections.map((section) => ({ ...section, works: [] })),
    });

    expect(headerRows(wrapper)[0]).toEqual([
      'ФИО',
      'ИСУ',
      'Поток',
      'Итог сумма',
      'Допуск от 60 баллов',
    ]);
    expect(wrapper.text()).toContain(
      'Разложите работы по разделам — они станут колонками ведомости.',
    );
  });

  it('напоминает, что таблицу можно дополнять своими столбцами', () => {
    expect(mountPreview().text()).toContain(
      'После создания в таблицу можно добавлять свои столбцы.',
    );
  });

  it('без групп просит отметить хотя бы одну', () => {
    const wrapper = mountPreview({ groups: [] });

    expect(wrapper.text()).toContain(
      'Отметьте хотя бы одну группу, чтобы увидеть ведомость.',
    );
    expect(wrapper.find('table').exists()).toBe(false);
  });
});
