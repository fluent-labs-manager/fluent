<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Link,
  List,
  MessageSquare,
  RotateCw,
  Users,
  Video,
} from '@lucide/vue';
import { useStudentEvents } from '@/composables/useStudentEvents.ts';

const {
  data,
  activeEvents,
  hideRead,
  showArchive,
  selectedDay,
  isLoading,
  error,
  reload,
  toggleArchive,
} = useStudentEvents();

const viewMode = ref<'list' | 'month'>('list');

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const currentMonthIndex = ref(9);
const currentYear = ref(2026);

const currentMonthLabel = computed(
  () => `${months[currentMonthIndex.value] ?? ''} ${String(currentYear.value)}`,
);

const handlePrevMonth = (): void => {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonthIndex.value -= 1;
  }
};

const handleNextMonth = (): void => {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0;
    currentYear.value += 1;
  } else {
    currentMonthIndex.value += 1;
  }
};

const daysInMonth = computed(() => {
  const daysCount = new Date(
    currentYear.value,
    currentMonthIndex.value + 1,
    0,
  ).getDate();
  return Array.from({ length: daysCount }, (_, i) => i + 1);
});

const eventDays = [20, 21, 24, 27];

const handleActionClick = (url?: string): void => {
  if (url !== undefined && url !== '') {
    window.open(url, '_blank');
  } else {
    alert('Подробная информация о событии');
  }
};
</script>

<template>
  <main class="events-page">
    <header class="events-header">
      <div class="user-info">
        <span class="user-meta">ГОРЕЛОВА УЛЬЯНА • Р3322</span>
        <h1 class="page-title">События</h1>
      </div>

      <div class="header-controls">
        <div class="view-switch">
          <button
            class="switch-btn"
            :class="{ 'switch-btn--active': viewMode === 'list' }"
            type="button"
            @click="viewMode = 'list'"
          >
            <List
              :size="14"
              class="switch-icon"
            />
            Список
          </button>
          <button
            class="switch-btn"
            :class="{ 'switch-btn--active': viewMode === 'month' }"
            type="button"
            @click="viewMode = 'month'"
          >
            <Calendar
              :size="14"
              class="switch-icon"
            />
            Месяц
          </button>
        </div>

        <button
          class="filter-toggle-btn"
          :class="{ 'filter-toggle-btn--active': hideRead }"
          type="button"
          @click="hideRead = !hideRead"
        >
          {{ hideRead ? 'Показать прочитанные' : 'Скрыть прочитанные' }}
        </button>

        <button
          class="filter-toggle-btn"
          :class="{ 'filter-toggle-btn--active': showArchive }"
          type="button"
          @click="showArchive = !showArchive"
        >
          {{ showArchive ? 'К событиям' : 'Архив' }}
        </button>
      </div>
    </header>

    <p
      v-if="isLoading"
      class="status-msg"
      role="status"
    >
      Загрузка событий…
    </p>

    <div
      v-else-if="error !== null"
      class="status-msg status-msg--error"
      role="alert"
    >
      <span>Не удалось загрузить события: {{ error }}</span>
      <button
        class="retry-btn"
        type="button"
        @click="reload"
      >
        <RotateCw :size="16" />
      </button>
    </div>

    <div
      v-else-if="viewMode === 'month'"
      class="month-view-container"
    >
      <div class="month-view-header">
        <button
          class="month-btn"
          type="button"
          aria-label="Предыдущий месяц"
          @click="handlePrevMonth"
        >
          <ChevronLeft :size="18" />
        </button>
        <h2 class="month-view-title">{{ currentMonthLabel }}</h2>
        <button
          class="month-btn"
          type="button"
          aria-label="Следующий месяц"
          @click="handleNextMonth"
        >
          <ChevronRight :size="18" />
        </button>
      </div>

      <div class="month-grid-large">
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="month-day-cell"
          :class="{ 'month-day-cell--active': day === selectedDay }"
          @click="
            selectedDay = day;
            viewMode = 'list';
          "
        >
          <span class="month-day-num">{{ day }}</span>
          <span
            v-if="eventDays.includes(day)"
            class="month-day-tag"
          >
            События
          </span>
        </div>
      </div>
    </div>

    <div
      v-else-if="data !== null"
      class="events-workspace"
    >
      <aside class="calendar-column">
        <article class="calendar-card">
          <div class="month-nav">
            <button
              class="month-btn"
              type="button"
              aria-label="Предыдущий месяц"
              @click="handlePrevMonth"
            >
              <ChevronLeft :size="15" />
            </button>
            <span class="month-label">{{ currentMonthLabel }}</span>
            <button
              class="month-btn"
              type="button"
              aria-label="Следующий месяц"
              @click="handleNextMonth"
            >
              <ChevronRight :size="15" />
            </button>
          </div>

          <div class="weekdays-row">
            <span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span
            ><span>ПТ</span><span>СБ</span><span>ВС</span>
          </div>

          <div class="days-grid">
            <div class="empty-day" />
            <div class="empty-day" />

            <button
              v-for="day in daysInMonth"
              :key="day"
              class="day-cell"
              :class="{
                'day-cell--selected': selectedDay === day,
                'day-cell--has-event': eventDays.includes(day),
              }"
              type="button"
              @click="selectedDay = day"
            >
              {{ day }}
              <span
                v-if="eventDays.includes(day)"
                class="event-dot"
              />
            </button>
          </div>

          <div class="calendar-legend">
            <span class="legend-dot" />
            <span>Запланировано {{ data.plannedEventsCount }} событий</span>
          </div>
        </article>

        <article class="milestone-card">
          <span class="milestone-label">БЛИЖАЙШАЯ КОНТРОЛЬНАЯ ТОЧКА</span>
          <h2 class="milestone-title">{{ data.upcomingMilestone.title }}</h2>
          <span class="milestone-date">
            {{ data.upcomingMilestone.dateText }} ·
            {{ data.upcomingMilestone.room }}
          </span>
        </article>
      </aside>

      <section class="events-column">
        <div
          v-if="activeEvents.length === 0"
          class="empty-events"
        >
          {{ showArchive ? 'В архиве нет событий.' : 'Нет активных событий.' }}
        </div>

        <ul
          v-else
          class="events-list"
        >
          <li
            v-for="event in activeEvents"
            :key="event.id"
            class="event-card"
            :class="{
              'event-card--read': event.isRead,
              'event-card--milestone': event.type === 'milestone',
            }"
          >
            <div class="event-date-col">
              <span class="event-day">{{ event.dayNumber }}</span>
              <span class="event-weekday">{{ event.weekdayLabel }}</span>
            </div>

            <div class="event-icon-box">
              <Video
                v-if="event.type === 'lecture'"
                :size="18"
              />
              <Users
                v-else-if="event.type === 'conference'"
                :size="18"
              />
              <GraduationCap
                v-else-if="event.type === 'exam'"
                :size="18"
              />
              <MessageSquare
                v-else
                :size="18"
              />
            </div>

            <div class="event-body">
              <div class="event-meta-top">
                <span class="time-range">{{ event.timeRange }}</span>
                <span
                  class="type-tag"
                  :class="`type-tag--${event.type}`"
                >
                  {{ event.typeLabel }}
                </span>
              </div>
              <h2 class="event-title">{{ event.title }}</h2>
              <span class="location-text">{{ event.locationOrUrl }}</span>
            </div>

            <div class="event-actions">
              <button
                v-if="event.actionType === 'join'"
                class="primary-action-btn"
                type="button"
                @click="handleActionClick(event.linkUrl)"
              >
                <ExternalLink :size="16" />
                Перейти
              </button>
              <button
                v-else
                class="outline-action-btn"
                type="button"
                @click="handleActionClick()"
              >
                Подробнее
              </button>

              <button
                class="archive-btn"
                type="button"
                :title="event.isArchived ? 'Восстановить' : 'В архив'"
                @click="toggleArchive(event.id)"
              >
                {{ event.isArchived ? '↩' : '×' }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <aside class="quick-column">
        <ul class="quick-actions-list">
          <li class="quick-action-item">
            <div class="quick-action-icon">
              <Calendar :size="16" />
            </div>
            <div class="quick-action-text">
              <span class="quick-action-title">Добавить в календарь</span>
              <span class="quick-action-sub">Экспорт ближайших событий</span>
            </div>
            <ChevronRight
              :size="16"
              class="quick-action-arrow"
            />
          </li>

          <li class="quick-action-item">
            <div class="quick-action-icon">
              <Bell :size="16" />
            </div>
            <div class="quick-action-text">
              <span class="quick-action-title">Напоминания</span>
              <span class="quick-action-sub">3 уведомления включены</span>
            </div>
            <ChevronRight
              :size="16"
              class="quick-action-arrow"
            />
          </li>

          <li class="quick-action-item">
            <div class="quick-action-icon">
              <Link :size="16" />
            </div>
            <div class="quick-action-text">
              <span class="quick-action-title">Онлайн-ссылки</span>
              <span class="quick-action-sub">2 активные встречи</span>
            </div>
            <ChevronRight
              :size="16"
              class="quick-action-arrow"
            />
          </li>
        </ul>

        <article class="reminder-card">
          <Video
            :size="20"
            class="reminder-icon"
          />
          <h2 class="reminder-title">Лекция начнётся через 45 минут</h2>
          <span class="reminder-sub"
            >Веб-программирование · Microsoft Teams</span
          >
          <button
            class="reminder-btn"
            type="button"
            @click="handleActionClick('https://teams.microsoft.com')"
          >
            <ExternalLink :size="16" />
            Перейти к лекции
          </button>
        </article>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.page-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-switch {
  display: flex;
  padding: 0.25rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  background-color: var(--color-surface);
}

.switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.875rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.switch-btn--active {
  background-color: var(--color-accent);
  color: #fff;
}

.filter-toggle-btn {
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.filter-toggle-btn--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.events-workspace {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.calendar-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 18.25rem;
}

.calendar-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.875rem;
  height: 1.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5625rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
  cursor: pointer;
}

.month-label {
  color: var(--color-text);
  font-size: 1.0625rem;
  font-weight: 700;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: center;
}

.days-grid {
  display: grid;
  gap: 0.125rem;
  grid-template-columns: repeat(7, 1fr);
}

.empty-day {
  height: 2.375rem;
}

.day-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 2.375rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.day-cell--selected {
  background-color: var(--color-accent);
  color: #fff;
  font-weight: 700;
}

.event-dot {
  width: 0.25rem;
  height: 0.25rem;
  margin-top: 0.125rem;
  border-radius: 50%;
  background-color: var(--color-success);
}

.day-cell--selected .event-dot {
  background-color: #fff;
}

.calendar-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.625rem;
}

.legend-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: var(--color-success);
}

.milestone-card {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--color-accent-surface);
}

.milestone-label {
  color: var(--color-text-secondary);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.milestone-title {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
}

.milestone-date {
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
}

.events-column {
  width: 32.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.event-card--milestone {
  border-color: #fce8e6;
}

.event-card--read {
  opacity: 0.7;
}

.event-date-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 3rem;
}

.event-day {
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.event-card--milestone .event-day {
  color: var(--color-error);
}

.event-weekday {
  color: var(--color-text-secondary);
  font-size: 0.5625rem;
  font-weight: 700;
}

.event-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.375rem;
  height: 2.375rem;
  border-radius: 0.6875rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
}

.event-card--milestone .event-icon-box {
  background-color: #fce8e6;
  color: var(--color-error);
}

.event-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.event-meta-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.625rem;
}

.time-range {
  color: var(--color-text);
  font-weight: 700;
}

.type-tag {
  font-weight: 700;
  text-transform: uppercase;
}

.type-tag--lecture {
  color: var(--color-text-secondary);
}

.type-tag--milestone {
  color: var(--color-error);
}

.event-title {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-text {
  color: var(--color-text-secondary);
  font-size: 0.625rem;
}

.event-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.primary-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2.375rem;
  padding: 0 1rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-btn-primary);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.outline-action-btn {
  height: 2.375rem;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.archive-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 1.125rem;
  cursor: pointer;
}

.archive-btn:hover {
  color: var(--color-text);
}

.quick-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 15rem;
}

.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.quick-action-item:hover {
  border-color: var(--color-accent);
}

.quick-action-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 0.625rem;
  background-color: var(--color-accent-surface);
  color: var(--color-text);
}

.quick-action-text {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.quick-action-title {
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 700;
}

.quick-action-sub {
  color: var(--color-text-secondary);
  font-size: 0.5625rem;
}

.quick-action-arrow {
  color: var(--color-text-secondary);
}

.reminder-card {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--color-accent);
  color: #fff;
}

.reminder-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.25;
}

.reminder-sub {
  color: rgb(255 255 255 / 80%);
  font-size: 0.625rem;
}

.reminder-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  height: 2.5rem;
  margin-top: 0.25rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary);
}

.empty-events {
  padding: 3rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.month-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 68.25rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
}

.month-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-view-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.month-grid-large {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(7, 1fr);
}

.month-day-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
}

.month-day-cell--active {
  border-color: var(--color-accent);
  background-color: var(--color-accent-surface);
}

.month-day-num {
  font-size: 0.875rem;
  font-weight: 700;
}

.month-day-tag {
  margin-top: auto;
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  background-color: var(--color-accent);
  color: #fff;
  font-size: 0.625rem;
}
</style>
