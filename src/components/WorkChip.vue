<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import WorkScoreForm from '@/components/WorkScoreForm.vue';
import type { GradebookWork } from '@/api/gradebook/GradebookWork.dto.ts';
import { WORK_DRAG_TYPE } from '@/constants/barsSections.ts';
import type { BarsSection } from '@/types/BarsSection.ts';
import type { WorkMoveTarget } from '@/types/WorkMoveTarget.ts';
import { pluralize } from '@/utils/Plural.ts';

const props = defineProps<{
  work: GradebookWork;
  // куда можно перенести работу
  targets: WorkMoveTarget[];
}>();

const emit = defineEmits<{
  move: [section: BarsSection | null];
  updateScore: [maxScore: number];
  remove: [];
}>();

const root = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const isMenuOpen = ref<boolean>(false);
// у правого края экрана меню раскрывается влево, чтобы не вылезать за него
const isMenuAlignedRight = ref<boolean>(false);
// вместо чипа — поле с баллами
const isEditing = ref<boolean>(false);

const label = computed<string>(
  () =>
    `${props.work.title}, ${pluralize(props.work.maxScore, ['балл', 'балла', 'баллов'])}`,
);

function closeMenu(): void {
  isMenuOpen.value = false;
}

// перетащить можно только мышью, поэтому по нажатию открывается список
// разделов: так работу переносят с клавиатуры и на телефоне
function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value;
}

function choose(section: BarsSection | null): void {
  closeMenu();
  emit('move', section);
}

// focusChip — вернуть фокус на чип; после клика мимо фокус остаётся там,
// куда щёлкнули
async function stopEditing(focusChip = true): Promise<void> {
  isEditing.value = false;
  await nextTick();
  if (focusChip) {
    handle.value?.focus();
  }
}

function startEditing(): void {
  closeMenu();
  isEditing.value = true;
}

async function saveScore(maxScore: number): Promise<void> {
  emit('updateScore', maxScore);
  await stopEditing();
}

function remove(): void {
  closeMenu();
  emit('remove');
}

function closeWithKeyboard(): void {
  closeMenu();
  handle.value?.focus();
}

// путь события, а не event.target: пункт меню, по которому щёлкнули, к этому
// моменту уже убран из страницы, и contains его бы не нашёл
function isOutside(event: MouseEvent): boolean {
  return root.value !== null && !event.composedPath().includes(root.value);
}

function closeOnOutsideClick(event: MouseEvent): void {
  if (isOutside(event)) {
    closeMenu();
  }
}

function cancelEditingOnOutsideClick(event: MouseEvent): void {
  if (isOutside(event)) {
    void stopEditing(false);
  }
}

function menuItems(): HTMLElement[] {
  return Array.from(
    menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );
}

// клавиши, как у меню по ARIA: стрелки по кругу, Home и End — к краям,
// Tab закрывает меню и возвращает фокус на чип
function onMenuKeydown(event: KeyboardEvent): void {
  const items = menuItems();
  const current = items.indexOf(document.activeElement as HTMLElement);
  const last = items.length - 1;
  const targets: Partial<Record<string, number>> = {
    ArrowDown: current >= last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
    Home: 0,
    End: last,
  };
  if (event.key === 'Tab') {
    event.preventDefault();
    closeWithKeyboard();
    return;
  }
  const target = targets[event.key];
  if (target !== undefined) {
    event.preventDefault();
    items[target]?.focus();
  }
}

watch(isMenuOpen, async (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', closeOnOutsideClick);
    isMenuAlignedRight.value = false;
    await nextTick();
    const menuRight = menu.value?.getBoundingClientRect().right ?? 0;
    isMenuAlignedRight.value = menuRight > document.documentElement.clientWidth;
    menuItems()[0]?.focus();
  } else {
    document.removeEventListener('click', closeOnOutsideClick);
  }
});

// поле с баллами закрывается кликом мимо без сохранения, как меню
watch(isEditing, (isOn) => {
  if (isOn) {
    document.addEventListener('click', cancelEditingOnOutsideClick);
  } else {
    document.removeEventListener('click', cancelEditingOnOutsideClick);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
  document.removeEventListener('click', cancelEditingOnOutsideClick);
});

function startDrag(event: DragEvent): void {
  closeMenu();
  if (event.dataTransfer !== null) {
    event.dataTransfer.setData(WORK_DRAG_TYPE, String(props.work.id));
    event.dataTransfer.effectAllowed = 'move';
  }
}
</script>

<template>
  <div
    ref="root"
    class="work-chip"
    @keydown.esc="closeWithKeyboard"
  >
    <!-- не <button>: Safari не начинает перетаскивание с кнопки. Поэтому
         элемент с ролью кнопки, а Enter и пробел открывают список, как у неё -->
    <WorkScoreForm
      v-if="isEditing"
      :title="work.title"
      :score="work.maxScore"
      @save="saveScore"
      @cancel="stopEditing"
    />
    <div
      v-else
      ref="handle"
      class="work-chip__button"
      :data-work-id="work.id"
      role="button"
      tabindex="0"
      draggable="true"
      :aria-label="label"
      aria-haspopup="menu"
      :aria-expanded="isMenuOpen"
      @click="toggleMenu"
      @keydown.enter.prevent="toggleMenu"
      @keydown.space.prevent="toggleMenu"
      @dragstart="startDrag"
    >
      <span class="work-chip__title">{{ work.title }}</span>
      <span class="work-chip__score">{{ work.maxScore }}</span>
    </div>
    <ul
      v-if="isMenuOpen"
      ref="menu"
      class="work-chip__menu"
      :class="{ 'work-chip__menu--right': isMenuAlignedRight }"
      role="menu"
      :aria-label="`Действия с «${work.title}»`"
      @keydown="onMenuKeydown"
    >
      <li
        v-for="target in targets"
        :key="target.section ?? 'pool'"
        role="none"
      >
        <button
          class="work-chip__target"
          type="button"
          role="menuitem"
          tabindex="-1"
          @click="choose(target.section)"
        >
          {{ target.title }}
        </button>
      </li>
      <li
        class="work-chip__separator"
        role="separator"
      ></li>
      <li role="none">
        <button
          class="work-chip__target"
          type="button"
          role="menuitem"
          tabindex="-1"
          @click="startEditing"
        >
          Изменить баллы
        </button>
      </li>
      <li role="none">
        <button
          class="work-chip__target work-chip__target--danger"
          type="button"
          role="menuitem"
          tabindex="-1"
          @click="remove"
        >
          Удалить работу
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.work-chip {
  position: relative;
  max-width: 100%;
}

.work-chip__button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  padding: 0.375rem 0.5rem 0.375rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 1.25rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: grab;
  transition: border-color 0.2s ease;
}

.work-chip__button:hover,
.work-chip__button[aria-expanded='true'] {
  border-color: var(--color-accent);
}

.work-chip__button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 0.125rem;
}

.work-chip__button:active {
  cursor: grabbing;
}

.work-chip__title {
  min-width: 0;

  /* в узкой карточке раздела длинное название переносится, а не вылезает */
  overflow-wrap: anywhere;
}

.work-chip__score {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 1em;
  background-color: var(--color-muted-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  white-space: nowrap;
}

.work-chip__menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  z-index: 10;
  min-width: 13rem;
  margin: 0;
  padding: 0.375rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-raised);
  list-style: none;
}

.work-chip__menu--right {
  right: 0;
  left: auto;
}

.work-chip__target {
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 0.5rem;
  background: none;
  color: var(--color-text);
  font-size: var(--font-size-md);
  text-align: left;
  cursor: pointer;
}

.work-chip__target:hover,
.work-chip__target:focus-visible {
  outline: none;
  background-color: var(--color-accent-surface);
}

.work-chip__target--danger {
  color: var(--color-error);
}

.work-chip__target--danger:hover,
.work-chip__target--danger:focus-visible {
  background-color: var(--color-error-surface);
}

.work-chip__separator {
  height: 1px;
  margin: 0.25rem 0;
  background-color: var(--color-border);
}
</style>
