import { describe, expect, it } from 'vitest';

import { nextTick, ref } from 'vue';
import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import { useScoreBuilder } from '@/composables/useScoreBuilder.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import { courseGradebookFixture } from '../fixtures.ts';

function createGradebook(): CourseGradebook {
  return structuredClone(courseGradebookFixture);
}

// другая дисциплина: те же данные, другой id и название
function createOtherGradebook(): CourseGradebook {
  return { ...createGradebook(), courseId: 12, courseTitle: 'Курс Б' };
}

function sectionScore(
  builder: ReturnType<typeof useScoreBuilder>,
  section: BarsSection,
): number | undefined {
  return builder.sections.value.find((item) => item.section === section)?.score;
}

describe('useScoreBuilder', () => {
  it('без дисциплины пуст', () => {
    const builder = useScoreBuilder(null);

    expect(builder.poolWorks.value).toEqual([]);
    expect(builder.distributedScore.value).toBe(0);
    expect(builder.maxScore.value).toBe(0);
    expect(builder.checkedGroups.value).toEqual([]);
    expect(builder.admissionThreshold.value).toBe(60);
  });

  it('раскладывает работы дисциплины: в разделах и в «Работах курса»', () => {
    const builder = useScoreBuilder(createGradebook());

    expect(builder.poolWorks.value.map((work) => work.title)).toEqual([
      'Работа Б',
      'Экзамен',
    ]);
    expect(builder.sections.value.map((item) => item.title)).toEqual([
      'Работа на занятиях',
      'Практика',
      'Контрольные работы',
      'Рубежный контроль',
      'Экзамен',
      'Доп. баллы',
    ]);
    expect(
      builder.sections.value.find(
        (item) => item.section === BarsSection.Practice,
      ),
    ).toMatchObject({ limit: 30, score: 15, isOverLimit: false });
  });

  it('считает разложенные баллы из 103', () => {
    const builder = useScoreBuilder(createGradebook());

    expect(builder.distributedScore.value).toBe(15);
    expect(builder.maxScore.value).toBe(103);
    expect(builder.isOverMaxScore.value).toBe(false);
  });

  it('по умолчанию отмечены все группы, а порог допуска — 60', () => {
    const builder = useScoreBuilder(createGradebook());

    expect(builder.checkedGroups.value.map((group) => group.name)).toEqual([
      'P0001',
      'P0002',
    ]);
    expect(builder.admissionThreshold.value).toBe(60);
  });

  it('переносит работу в раздел и обратно в «Работы курса»', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.moveWork(3, BarsSection.Exam);

    expect(sectionScore(builder, BarsSection.Exam)).toBe(25);
    expect(builder.poolWorks.value.map((work) => work.id)).toEqual([2]);

    builder.moveWork(3, null);

    expect(sectionScore(builder, BarsSection.Exam)).toBe(0);
    expect(builder.poolWorks.value.map((work) => work.id)).toEqual([2, 3]);
  });

  it('отмечает раздел сверх лимита', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.moveWork(3, BarsSection.Exam);

    expect(
      builder.sections.value.find((item) => item.section === BarsSection.Exam),
    ).toMatchObject({ limit: 20, score: 25, isOverLimit: true });
  });

  it('отмечает превышение 103 баллов', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.addWork('Большая работа', 90);
    builder.moveWork(4, BarsSection.Practice);

    expect(builder.distributedScore.value).toBe(105);
    expect(builder.isOverMaxScore.value).toBe(true);
  });

  it('новая работа получает следующий id и попадает в «Работы курса»', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.addWork('ЛР6', 10);

    expect(builder.poolWorks.value.at(-1)).toEqual({
      id: 4,
      title: 'ЛР6',
      maxScore: 10,
      section: null,
    });
  });

  it('меняет баллы работы и удаляет её', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.updateWorkScore(1, 20);
    expect(sectionScore(builder, BarsSection.Practice)).toBe(20);

    builder.removeWork(1);
    expect(sectionScore(builder, BarsSection.Practice)).toBe(0);
    expect(builder.distributedScore.value).toBe(0);
  });

  it('снимает и возвращает отметку группы, сохраняя порядок групп', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.setGroupChecked('P0001', false);
    expect(builder.checkedGroups.value.map((group) => group.name)).toEqual([
      'P0002',
    ]);

    builder.setGroupChecked('P0001', true);
    expect(builder.checkedGroups.value.map((group) => group.name)).toEqual([
      'P0001',
      'P0002',
    ]);
  });

  it('меняет порог допуска', () => {
    const builder = useScoreBuilder(createGradebook());

    builder.setAdmissionThreshold(55);

    expect(builder.admissionThreshold.value).toBe(55);
  });

  it('не меняет данные, из которых построен', () => {
    const gradebook = createGradebook();
    const builder = useScoreBuilder(gradebook);

    builder.moveWork(2, BarsSection.ClassWork);

    expect(gradebook.works[1]?.section).toBeNull();
  });

  describe('память по дисциплинам', () => {
    it('при возврате к дисциплине показывает её раскладку', async () => {
      const gradebook = ref<CourseGradebook | null>(createGradebook());
      const builder = useScoreBuilder(gradebook);
      builder.moveWork(2, BarsSection.ClassWork);
      builder.setGroupChecked('P0002', false);
      builder.setAdmissionThreshold(50);

      gradebook.value = createOtherGradebook();
      await nextTick();

      expect(sectionScore(builder, BarsSection.ClassWork)).toBe(0);
      expect(builder.checkedGroups.value).toHaveLength(2);
      expect(builder.admissionThreshold.value).toBe(60);

      gradebook.value = createGradebook();
      await nextTick();

      expect(sectionScore(builder, BarsSection.ClassWork)).toBe(10);
      expect(builder.checkedGroups.value.map((group) => group.name)).toEqual([
        'P0001',
      ]);
      expect(builder.admissionThreshold.value).toBe(50);
    });

    it('пока дисциплина загружается, раскладки нет', async () => {
      const gradebook = ref<CourseGradebook | null>(createGradebook());
      const builder = useScoreBuilder(gradebook);

      gradebook.value = null;
      await nextTick();

      expect(builder.poolWorks.value).toEqual([]);
      expect(builder.sections.value.every((item) => item.score === 0)).toBe(
        true,
      );
    });

    it('без дисциплины действия ничего не делают', () => {
      const builder = useScoreBuilder(null);

      builder.addWork('ЛР6', 10);
      builder.moveWork(1, BarsSection.Exam);
      builder.updateWorkScore(1, 5);
      builder.removeWork(1);
      builder.setGroupChecked('P0001', true);
      builder.setAdmissionThreshold(50);

      expect(builder.poolWorks.value).toEqual([]);
      expect(builder.checkedGroups.value).toEqual([]);
      expect(builder.admissionThreshold.value).toBe(60);
    });
  });
});
