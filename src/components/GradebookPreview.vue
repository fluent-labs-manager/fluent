<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';

import type { StudentGroup } from '@/api/gradebook/StudentGroup.dto.ts';
import type { SectionSummary } from '@/types/SectionSummary.ts';
import { pluralize } from '@/utils/Plural.ts';

const props = defineProps<{
  // группы, для которых готовится ведомость: по вкладке на группу
  groups: StudentGroup[];
  sections: SectionSummary[];
  admissionThreshold: number;
}>();

const idPrefix = useId();
const tabs = ref<HTMLButtonElement[]>([]);
const selectedName = ref<string | null>(null);

// если открытую группу сняли с ведомости, открыта первая из оставшихся
const activeGroup = computed<StudentGroup | null>(
  () =>
    props.groups.find((group) => group.name === selectedName.value) ??
    props.groups[0] ??
    null,
);

// колонками становятся только разложенные работы; пустые разделы не нужны
const filledSections = computed<SectionSummary[]>(() =>
  props.sections.filter((section) => section.works.length > 0),
);

function tabId(index: number): string {
  return `${idPrefix}-tab-${String(index)}`;
}

const panelId = `${idPrefix}-panel`;

const activeIndex = computed<number>(() =>
  props.groups.findIndex((group) => group.name === activeGroup.value?.name),
);

async function selectTab(index: number): Promise<void> {
  const group = props.groups[index];
  if (group === undefined) {
    return;
  }
  selectedName.value = group.name;
  await nextTick();
  tabs.value[index]?.focus();
}

// клавиши, как у вкладок по ARIA: стрелки по кругу, Home и End — к краям
function onTabKeydown(event: KeyboardEvent, index: number): void {
  const last = props.groups.length - 1;
  const targets: Partial<Record<string, number>> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  };
  const target = targets[event.key];
  if (target !== undefined) {
    event.preventDefault();
    void selectTab(target);
  }
}

// «Группа P3322 · 6 студентов»
const caption = computed<string>(() => {
  const group = activeGroup.value;
  if (group === null) {
    return '';
  }
  const count = pluralize(group.students.length, [
    'студент',
    'студента',
    'студентов',
  ]);
  return `Группа ${group.name} · ${count}`;
});
</script>

<template>
  <section
    class="gradebook-preview"
    aria-labelledby="gradebook-preview-heading"
  >
    <h2
      id="gradebook-preview-heading"
      class="gradebook-preview__title"
    >
      Предпросмотр ведомости
    </h2>

    <p
      v-if="activeGroup === null"
      class="gradebook-preview__empty"
    >
      Отметьте хотя бы одну группу, чтобы увидеть ведомость.
    </p>

    <template v-else>
      <div
        class="gradebook-preview__tabs"
        role="tablist"
        aria-label="Группы"
      >
        <button
          v-for="(group, index) in groups"
          :id="tabId(index)"
          :key="group.name"
          ref="tabs"
          class="gradebook-preview__tab"
          :class="{
            'gradebook-preview__tab--active': index === activeIndex,
          }"
          type="button"
          role="tab"
          :aria-selected="index === activeIndex"
          :aria-controls="panelId"
          :tabindex="index === activeIndex ? 0 : -1"
          @click="selectTab(index)"
          @keydown="onTabKeydown($event, index)"
        >
          {{ group.name }}
        </button>
      </div>

      <!-- панель прокручивается сама: на узком экране таблица шире страницы -->
      <div
        :id="panelId"
        class="gradebook-preview__panel"
        role="tabpanel"
        :aria-labelledby="tabId(activeIndex)"
        tabindex="0"
      >
        <table class="gradebook-preview__table">
          <caption class="gradebook-preview__caption">
            {{
              caption
            }}
          </caption>
          <thead>
            <tr>
              <th
                class="gradebook-preview__head"
                scope="col"
                rowspan="2"
              >
                ФИО
              </th>
              <th
                class="gradebook-preview__head"
                scope="col"
                rowspan="2"
              >
                ИСУ
              </th>
              <th
                class="gradebook-preview__head"
                scope="col"
                rowspan="2"
              >
                Поток
              </th>
              <th
                v-for="section in filledSections"
                :key="section.section"
                class="gradebook-preview__head gradebook-preview__head--section"
                scope="colgroup"
                :colspan="section.works.length"
              >
                {{ section.title }}
              </th>
              <th
                class="gradebook-preview__head gradebook-preview__head--total"
                scope="col"
                rowspan="2"
              >
                Итог
                <span class="gradebook-preview__note">сумма</span>
              </th>
              <th
                class="gradebook-preview__head gradebook-preview__head--total"
                scope="col"
                rowspan="2"
              >
                Допуск
                <span class="gradebook-preview__note">
                  от {{ admissionThreshold }} баллов
                </span>
              </th>
            </tr>
            <tr>
              <template
                v-for="section in filledSections"
                :key="section.section"
              >
                <th
                  v-for="work in section.works"
                  :key="work.id"
                  class="gradebook-preview__head gradebook-preview__head--work"
                  scope="col"
                >
                  {{ work.title }}
                  <span class="gradebook-preview__note">
                    из {{ work.maxScore }}
                  </span>
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in activeGroup.students"
              :key="student.id"
            >
              <th
                class="gradebook-preview__cell gradebook-preview__cell--name"
                scope="row"
              >
                {{ student.fullName }}
              </th>
              <td class="gradebook-preview__cell">{{ student.isuId }}</td>
              <td class="gradebook-preview__cell">{{ student.stream }}</td>
              <template
                v-for="section in filledSections"
                :key="section.section"
              >
                <td
                  v-for="work in section.works"
                  :key="work.id"
                  class="gradebook-preview__cell gradebook-preview__cell--score"
                ></td>
              </template>
              <td
                class="gradebook-preview__cell gradebook-preview__cell--score"
              ></td>
              <td
                class="gradebook-preview__cell gradebook-preview__cell--score"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        v-if="filledSections.length === 0"
        class="gradebook-preview__hint"
      >
        Разложите работы по разделам — они станут колонками ведомости.
      </p>
      <p class="gradebook-preview__hint">
        После создания в таблицу можно добавлять свои столбцы.
      </p>
    </template>
  </section>
</template>

<style scoped>
.gradebook-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.gradebook-preview__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.gradebook-preview__empty,
.gradebook-preview__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* вкладки, как листы внизу таблицы. Прокрутка только по горизонтали
   и только когда группы не помещаются в строку. Линия под вкладками —
   тень внутри: её закрывает фон выбранной вкладки, и ничего не вылезает
   вниз, иначе браузер добавил бы вертикальную полосу прокрутки */
.gradebook-preview__tabs {
  display: flex;
  gap: 0.25rem;
  overflow: auto hidden;
  box-shadow: inset 0 -1px 0 var(--color-border);
}

.gradebook-preview__tab {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.75rem 0.75rem 0 0;
  background: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
}

.gradebook-preview__tab:hover {
  color: var(--color-text);
}

.gradebook-preview__tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.gradebook-preview__tab--active {
  border-color: var(--color-border);
  border-bottom-color: var(--color-surface);
  background-color: var(--color-surface);
  color: var(--color-accent);
}

.gradebook-preview__panel {
  max-width: 100%;
  overflow-x: auto;
}

.gradebook-preview__panel:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}

.gradebook-preview__table {
  min-width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.gradebook-preview__caption {
  padding-bottom: 0.5rem;
  color: var(--color-text-secondary);
  text-align: left;
}

.gradebook-preview__head,
.gradebook-preview__cell {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  text-align: left;
}

.gradebook-preview__head {
  background-color: var(--color-muted-surface);
  font-weight: 700;
  white-space: nowrap;
  vertical-align: bottom;
}

.gradebook-preview__head--section {
  color: var(--color-accent);
  text-align: center;
}

.gradebook-preview__head--work,
.gradebook-preview__head--total {
  text-align: center;
}

.gradebook-preview__note {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 400;
}

.gradebook-preview__cell {
  white-space: nowrap;
}

.gradebook-preview__cell--name {
  font-weight: 400;
}

/* пустые ячейки для баллов, как в только что созданной таблице */
.gradebook-preview__cell--score {
  min-width: 4rem;
}
</style>
