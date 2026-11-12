<script setup lang="ts">
import { computed, ref, useId } from 'vue';

import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';

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

function selectGroup(name: string | number): void {
  selectedName.value = String(name);
}

// подпись лежит вне таблицы, поэтому таблица называется по её id
function getCaptionId(group: StudentGroup): string {
  return `${idPrefix}-caption-${group.name}`;
}

// «Группа P3322 · 6 студентов»
function getCaption(group: StudentGroup): string {
  const count = pluralize(group.students.length, [
    'студент',
    'студента',
    'студентов',
  ]);
  return `Группа ${group.name} · ${count}`;
}
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
    <p class="gradebook-preview__hint">
      Так будет выглядеть Google-таблица после создания. Баллы ставятся в самой
      таблице, туда же можно добавлять свои столбцы.
    </p>

    <p
      v-if="activeGroup === null"
      class="gradebook-preview__empty"
    >
      Отметьте хотя бы одну группу, чтобы увидеть ведомость.
    </p>

    <template v-else>
      <!-- стрелки переключают группу сразу, а не только переводят фокус;
           lazy: строится таблица только открытой группы -->
      <Tabs
        :value="activeGroup.name"
        scrollable
        select-on-focus
        lazy
        @update:value="selectGroup"
      >
        <TabList :pt="{ tabList: { 'aria-label': 'Группы' } }">
          <Tab
            v-for="group in groups"
            :key="group.name"
            :value="group.name"
          >
            {{ group.name }}
          </Tab>
        </TabList>
        <TabPanels class="gradebook-preview__panels">
          <!-- сама панель не в порядке Tab: с клавиатуры прокручивают
               область с таблицей внутри неё -->
          <TabPanel
            v-for="group in groups"
            :key="group.name"
            :value="group.name"
            :pt="{ root: { tabindex: -1 } }"
          >
            <!-- подпись над прокруткой: иначе уезжает вместе с таблицей -->
            <p
              :id="getCaptionId(group)"
              class="gradebook-preview__caption"
            >
              {{ getCaption(group) }}
            </p>
            <!-- на узком экране таблица шире карточки и прокручивается здесь -->
            <div
              class="gradebook-preview__scroll"
              role="region"
              :aria-labelledby="getCaptionId(group)"
              tabindex="0"
            >
              <table
                class="gradebook-preview__table"
                :aria-labelledby="getCaptionId(group)"
              >
                <thead>
                  <tr>
                    <th
                      class="gradebook-preview__head gradebook-preview__head--name"
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
                    v-for="student in group.students"
                    :key="student.id"
                  >
                    <th
                      class="gradebook-preview__cell gradebook-preview__cell--name"
                      scope="row"
                    >
                      {{ student.fullName }}
                    </th>
                    <td class="gradebook-preview__cell">{{ student.isuId }}</td>
                    <td class="gradebook-preview__cell">
                      {{ student.stream }}
                    </td>
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      <p
        v-if="filledSections.length === 0"
        class="gradebook-preview__hint"
      >
        Разложите работы по разделам — они станут колонками ведомости.
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

.gradebook-preview__panels {
  padding: 0.75rem 0 0;
}

/* кнопка «›» лежит поверх ряда вкладок. PrimeVue прокручивает ряд
   к выбранной вкладке, но кнопку не учитывает, а из-за дробной ширины
   вкладок не замечает конец ряда и не прячет её. Поэтому в конце ряда
   пустое место на ширину кнопки, а прокрутка держит такой же отступ —
   последняя вкладка не уходит под кнопку */
.gradebook-preview :deep(.p-tablist-viewport) {
  scroll-padding-inline: var(--p-tabs-nav-button-width);
}

/* пустое место — отдельный элемент в конце ряда: отступ самого ряда
   не сработает, вкладки выходят за его край */
.gradebook-preview :deep(.p-tablist-tab-list)::after {
  content: '';
  flex: 0 0 var(--p-tabs-nav-button-width);
}

.gradebook-preview__caption {
  margin: 0 0 0.5rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.gradebook-preview__scroll {
  max-width: 100%;
  overflow-x: auto;
}

.gradebook-preview__scroll:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}

/* рамки рисует каждая ячейка (справа и снизу), а не общая сетка таблицы:
   при border-collapse закреплённая колонка ФИО не закрывает общие рамки,
   и сквозь них видно ячейки, уехавшие под неё. Верхняя рамка — у таблицы,
   левая — у колонки ФИО */
.gradebook-preview__table {
  min-width: 100%;
  border-top: 1px solid var(--color-border);
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--font-size-sm);
}

.gradebook-preview__head,
.gradebook-preview__cell {
  padding: 0.5rem 0.75rem;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
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
  background-color: var(--color-surface);
  font-weight: 400;
}

/* ФИО остаётся на месте, когда таблицу прокручивают вправо к работам */
.gradebook-preview__head--name,
.gradebook-preview__cell--name {
  position: sticky;
  left: 0;
  z-index: 1;
  border-left: 1px solid var(--color-border);
}

/* пустые ячейки для баллов, как в только что созданной таблице */
.gradebook-preview__cell--score {
  min-width: 4rem;
}
</style>
