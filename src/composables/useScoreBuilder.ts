import { computed, reactive, shallowRef, toRaw, toValue, watch } from 'vue';
import type { ComputedRef, MaybeRefOrGetter } from 'vue';

import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import type { StudentGroup } from '@/api/gradebook/StudentGroup.dto.ts';
import {
  BARS_SECTION_LABELS,
  BARS_SECTION_ORDER,
  DEFAULT_ADMISSION_THRESHOLD,
} from '@/constants/barsSections.ts';
import { BarsSection } from '@/types/BarsSection.ts';
import {
  getNextWorkId,
  getSectionWorks,
  sumMaxScores,
} from '@/utils/ScoreBuilder.ts';

// то, что преподаватель настроил для одной дисциплины
interface ScoreBuilderDraft {
  works: GradebookWork[];
  // названия групп, для которых готовится ведомость
  checkedGroups: string[];
  admissionThreshold: number;
}

export interface SectionSummary {
  section: BarsSection;
  title: string;
  limit: number;
  // сумма баллов разложенных в раздел работ
  score: number;
  isOverLimit: boolean;
  works: GradebookWork[];
}

interface UseScoreBuilderResult {
  // работы, ещё не разложенные по разделам
  poolWorks: ComputedRef<GradebookWork[]>;
  sections: ComputedRef<SectionSummary[]>;
  // сколько баллов разложено по всем разделам
  distributedScore: ComputedRef<number>;
  // сколько можно разложить: сумма лимитов, 100 + 3 доп. балла
  maxScore: ComputedRef<number>;
  isOverMaxScore: ComputedRef<boolean>;
  checkedGroups: ComputedRef<StudentGroup[]>;
  admissionThreshold: ComputedRef<number>;
  moveWork: (workId: number, section: BarsSection | null) => void;
  addWork: (title: string, maxScore: number) => void;
  updateWorkScore: (workId: number, maxScore: number) => void;
  removeWork: (workId: number) => void;
  setGroupChecked: (groupName: string, isChecked: boolean) => void;
  setAdmissionThreshold: (threshold: number) => void;
}

// состояние конструктора баллов. Ничего не сохраняется, но, пока страница
// открыта, раскладка каждой дисциплины запоминается: при возврате к дисциплине
// преподаватель видит то, что настроил
export function useScoreBuilder(
  gradebook: MaybeRefOrGetter<CourseGradebook | null>,
): UseScoreBuilderResult {
  const drafts = new Map<number, ScoreBuilderDraft>();
  const draft = shallowRef<ScoreBuilderDraft | null>(null);

  watch(
    () => toValue(gradebook),
    (data) => {
      if (data === null) {
        draft.value = null;
        return;
      }
      let saved = drafts.get(data.courseId);
      if (saved === undefined) {
        // по умолчанию ведомость готовится для всех групп дисциплины
        saved = reactive<ScoreBuilderDraft>({
          // данные приходят реактивными: копируем исходный объект, а не прокси
          works: structuredClone(toRaw(data).works),
          checkedGroups: data.groups.map((group) => group.name),
          admissionThreshold: DEFAULT_ADMISSION_THRESHOLD,
        });
        drafts.set(data.courseId, saved);
      }
      draft.value = saved;
    },
    { immediate: true },
  );

  const works = computed<GradebookWork[]>(() => draft.value?.works ?? []);

  const poolWorks = computed<GradebookWork[]>(() =>
    getSectionWorks(works.value, null),
  );

  const sections = computed<SectionSummary[]>(() => {
    const limits = toValue(gradebook)?.sectionLimits ?? [];
    return BARS_SECTION_ORDER.map((section) => {
      const sectionWorks = getSectionWorks(works.value, section);
      const score = sumMaxScores(sectionWorks);
      const limit = limits.find((item) => item.section === section)?.limit ?? 0;
      return {
        section,
        title: BARS_SECTION_LABELS[section],
        limit,
        score,
        isOverLimit: score > limit,
        works: sectionWorks,
      };
    });
  });

  const distributedScore = computed<number>(() =>
    sumMaxScores(works.value.filter((work) => work.section !== null)),
  );

  const maxScore = computed<number>(() =>
    (toValue(gradebook)?.sectionLimits ?? []).reduce(
      (sum, item) => sum + item.limit,
      0,
    ),
  );

  const isOverMaxScore = computed<boolean>(
    () => distributedScore.value > maxScore.value,
  );

  const checkedGroups = computed<StudentGroup[]>(() =>
    (toValue(gradebook)?.groups ?? []).filter(
      (group) => draft.value?.checkedGroups.includes(group.name) ?? false,
    ),
  );

  const admissionThreshold = computed<number>(
    () => draft.value?.admissionThreshold ?? DEFAULT_ADMISSION_THRESHOLD,
  );

  function findWork(workId: number): GradebookWork | undefined {
    return draft.value?.works.find((work) => work.id === workId);
  }

  function moveWork(workId: number, section: BarsSection | null): void {
    const work = findWork(workId);
    if (work !== undefined) {
      work.section = section;
    }
  }

  // новая работа попадает в «Работы курса»
  function addWork(title: string, maxScore: number): void {
    if (draft.value === null) {
      return;
    }
    draft.value.works.push({
      id: getNextWorkId(draft.value.works),
      title,
      maxScore,
      section: null,
    });
  }

  function updateWorkScore(workId: number, maxScore: number): void {
    const work = findWork(workId);
    if (work !== undefined) {
      work.maxScore = maxScore;
    }
  }

  function removeWork(workId: number): void {
    if (draft.value !== null) {
      draft.value.works = draft.value.works.filter(
        (work) => work.id !== workId,
      );
    }
  }

  function setGroupChecked(groupName: string, isChecked: boolean): void {
    if (draft.value === null) {
      return;
    }
    const others = draft.value.checkedGroups.filter(
      (name) => name !== groupName,
    );
    draft.value.checkedGroups = isChecked ? [...others, groupName] : others;
  }

  function setAdmissionThreshold(threshold: number): void {
    if (draft.value !== null) {
      draft.value.admissionThreshold = threshold;
    }
  }

  return {
    poolWorks,
    sections,
    distributedScore,
    maxScore,
    isOverMaxScore,
    checkedGroups,
    admissionThreshold,
    moveWork,
    addWork,
    updateWorkScore,
    removeWork,
    setGroupChecked,
    setAdmissionThreshold,
  };
}
