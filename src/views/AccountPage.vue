<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Mail,
  Pencil,
  RotateCw,
  Settings,
} from '@lucide/vue';

import { useAccountProfile } from '@/composables/useAccountProfile.ts';
import { useSemesters } from '@/composables/useSemesters.ts';
import { useTaughtCourses } from '@/composables/useTaughtCourses.ts';
import { useUserStore } from '@/stores/user.ts';
import type { Course } from '@/api/courses/Course.dto.ts';
import { UserRole } from '@/types/UserRole.ts';
import { formatGrade } from '@/utils/GradeFormatter.ts';
import { formatPercent, getPercent } from '@/utils/ProgressPercentage.ts';

interface ProfileDetail {
  icon: Component;
  label: string;
  value: string;
}

interface ProfileStat {
  label: string;
  value: string;
  hint: string;
  accent: boolean;
}

const router = useRouter();
// пользователя загружает MainLayout
const userStore = useUserStore();

const role = computed<UserRole | null>(() => userStore.user?.role ?? null);

const {
  profile,
  isLoading: isProfileLoading,
  error: profileError,
  reload: reloadProfile,
} = useAccountProfile();

const isStudent = computed<boolean>(() => role.value === UserRole.Student);

// дисциплины и прогресс студента уже есть в семестрах
const {
  semesters,
  isLoading: areSemestersLoading,
  error: semestersError,
  reload: reloadSemesters,
} = useSemesters(() => isStudent.value);

const {
  courses: taughtCourses,
  isLoading: areTaughtCoursesLoading,
  error: taughtCoursesError,
  reload: reloadTaughtCourses,
} = useTaughtCourses(() => role.value === UserRole.Teacher);

// списки дисциплин зависят от роли
const areCoursesLoading = computed<boolean>(() =>
  isStudent.value ? areSemestersLoading.value : areTaughtCoursesLoading.value,
);

const coursesError = computed<string | null>(() =>
  isStudent.value ? semestersError.value : taughtCoursesError.value,
);

const isLoading = computed<boolean>(() => {
  if (userStore.user === null) {
    return userStore.error === null;
  }
  return isProfileLoading.value;
});

// разметка строится по роли пользователя, профиль другой роли — ошибка
const isProfileMismatch = computed<boolean>(
  () =>
    profile.value !== null &&
    role.value !== null &&
    profile.value.role !== role.value,
);

// без дисциплин профиль всё равно показываем — их ошибка в своей колонке
const error = computed<string | null>(
  () =>
    userStore.error ??
    profileError.value ??
    (isProfileMismatch.value
      ? 'Профиль не совпадает с ролью пользователя'
      : null),
);

// сводка считается из дисциплин, без них она была бы нулевой
const areCoursesReady = computed<boolean>(
  () => !areCoursesLoading.value && coursesError.value === null,
);

// фото в данных нет — показываем инициалы. Нужен ли avatarUrl — согласовать
const initials = computed<string>(() =>
  (userStore.user?.name ?? '')
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join(''),
);

const roleLabel = computed<string>(() => {
  const user = userStore.user;
  if (user === null) {
    return '';
  }
  if (user.role === UserRole.Teacher) {
    return 'Преподаватель';
  }
  return user.group === null ? 'Студент' : `Студент · ${user.group}`;
});

const details = computed<ProfileDetail[]>(() => {
  const data = profile.value;
  if (data === null) {
    return [];
  }

  const email: ProfileDetail = {
    icon: Mail,
    label: 'Корпоративная почта',
    value: data.email,
  };

  if (data.role === UserRole.Teacher) {
    return [
      email,
      { icon: Building2, label: 'Подразделение', value: data.department },
      { icon: Briefcase, label: 'Должность', value: data.position },
    ];
  }

  return [
    email,
    { icon: GraduationCap, label: 'Направление', value: data.direction },
    {
      icon: Calendar,
      label: 'Курс и поток',
      value: `${String(data.courseYear)} курс · ${data.stream}`,
    },
  ];
});

const currentSemester = computed(() =>
  semesters.value.find((semester) => semester.isCurrent),
);

const currentCourses = computed<Course[]>(
  () => currentSemester.value?.courses ?? [],
);

// сводку считаем на фронте из списков; если бэк будет отдавать готовые числа — брать их
const stats = computed<ProfileStat[]>(() => {
  const data = profile.value;
  if (data === null) {
    return [];
  }

  if (data.role === UserRole.Teacher) {
    const pending = taughtCourses.value.reduce(
      (sum, course) => sum + course.pendingReviews,
      0,
    );
    const groups = new Set(
      taughtCourses.value.flatMap((course) => course.groups),
    );
    return [
      {
        label: 'Ждут проверки',
        value: String(pending),
        hint: 'работ без оценки',
        accent: pending > 0,
      },
      // эту карточку придумали, на макете её нет
      {
        label: 'Дисциплин',
        value: String(taughtCourses.value.length),
        hint: `групп: ${String(groups.size)}`,
        accent: false,
      },
    ];
  }

  const done = currentCourses.value.reduce(
    (sum, course) => sum + course.completedLabs,
    0,
  );
  const total = currentCourses.value.reduce(
    (sum, course) => sum + course.totalLabs,
    0,
  );
  const result: ProfileStat[] = [
    {
      label: 'Сдано работ',
      value: `${String(done)} из ${String(total)}`,
      hint: `${formatPercent(getPercent(done, total))} общего плана`,
      accent: true,
    },
  ];
  if (currentSemester.value !== undefined) {
    const grade = currentSemester.value.averageGrade;
    result.push({
      label: 'Средний балл',
      value: grade === null ? '—' : `${formatGrade(grade)} / 5`,
      hint: grade === null ? 'оценок пока нет' : 'за текущий семестр',
      accent: false,
    });
  }
  return result;
});

function goBack(): void {
  const state = window.history.state as { back?: unknown } | null;
  if (typeof state?.back === 'string') {
    router.back();
  } else {
    void router.push({ name: 'home' });
  }
}

// повторяем только то, что не загрузилось
function retry(): void {
  if (userStore.error !== null) {
    void userStore.loadUser();
  }
  if (profileError.value !== null || isProfileMismatch.value) {
    void reloadProfile();
  }
  if (coursesError.value !== null) {
    retryCourses();
  }
}

function retryCourses(): void {
  void (isStudent.value ? reloadSemesters() : reloadTaughtCourses());
}
</script>

<template>
  <main class="account-page">
    <header class="account-page__header">
      <button
        class="account-page__back"
        type="button"
        @click="goBack"
      >
        <ChevronLeft :size="16" />
        Назад
      </button>
      <h1 class="account-page__title">Личный кабинет</h1>
    </header>

    <p
      v-if="isLoading"
      class="account-page__status"
      role="status"
    >
      Загрузка профиля…
    </p>

    <div
      v-else-if="error !== null"
      class="account-page__status account-page__status--error"
      role="alert"
    >
      <span>Не удалось загрузить данные: {{ error }}</span>
      <button
        class="account-page__retry"
        type="button"
        aria-label="Повторить"
        title="Повторить"
        @click="retry"
      >
        <RotateCw :size="16" />
      </button>
    </div>

    <div
      v-else-if="userStore.user !== null && profile !== null"
      class="account-page__content"
    >
      <section
        class="account-page__column"
        aria-labelledby="account-personal-heading"
      >
        <h2
          id="account-personal-heading"
          class="account-page__section-title"
        >
          Личные данные
        </h2>

        <article class="account-page__card account-page__profile">
          <div class="account-page__identity">
            <span
              class="account-page__avatar"
              aria-hidden="true"
              >{{ initials }}</span
            >
            <div class="account-page__identity-text">
              <p class="account-page__name">{{ userStore.user.name }}</p>
              <span class="account-page__role">{{ roleLabel }}</span>
            </div>
          </div>

          <!-- подписей полей нет, по макету их заменяют иконки; label остаётся подсказкой -->
          <ul class="account-page__details">
            <li
              v-for="detail in details"
              :key="detail.label"
              class="account-page__detail"
              :title="detail.label"
            >
              <component
                :is="detail.icon"
                class="account-page__detail-icon"
                :size="18"
              />
              <span class="account-page__detail-value">{{ detail.value }}</span>
            </li>
          </ul>

          <!-- TODO: редактирование профиля и настройки — отдельные задачи -->
          <div class="account-page__actions">
            <button
              class="account-page__action account-page__action--primary"
              type="button"
              disabled
              title="Скоро будет доступно"
            >
              <Pencil :size="16" />
              Редактировать
            </button>
            <button
              class="account-page__action"
              type="button"
              disabled
              title="Скоро будет доступно"
            >
              <Settings :size="16" />
              Настройки
            </button>
          </div>
        </article>

        <div
          v-if="areCoursesReady"
          class="account-page__stats"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="account-page__card account-page__stat"
          >
            <p class="account-page__stat-label">{{ stat.label }}</p>
            <p
              class="account-page__stat-value"
              :class="{ 'account-page__stat-value--accent': stat.accent }"
            >
              {{ stat.value }}
            </p>
            <p class="account-page__stat-hint">{{ stat.hint }}</p>
          </div>
        </div>
      </section>

      <section
        class="account-page__column"
        aria-labelledby="account-courses-heading"
      >
        <h2
          id="account-courses-heading"
          class="account-page__section-title"
        >
          {{ isStudent ? 'Текущие дисциплины' : 'Мои дисциплины' }}
        </h2>

        <p
          v-if="areCoursesLoading"
          class="account-page__status"
          role="status"
        >
          Загрузка дисциплин…
        </p>

        <div
          v-else-if="coursesError !== null"
          class="account-page__status account-page__status--error"
          role="alert"
        >
          <span>Не удалось загрузить дисциплины: {{ coursesError }}</span>
          <button
            class="account-page__retry"
            type="button"
            aria-label="Повторить"
            title="Повторить"
            @click="retryCourses"
          >
            <RotateCw :size="16" />
          </button>
        </div>

        <template v-else-if="isStudent">
          <p
            v-if="currentCourses.length === 0"
            class="account-page__empty"
          >
            Дисциплин пока нет.
          </p>
          <ul
            v-else
            class="account-page__courses"
          >
            <li
              v-for="course in currentCourses"
              :key="course.id"
            >
              <RouterLink
                class="account-page__card account-page__course account-page__course--link"
                :to="{ name: 'course-labs', params: { courseId: course.id } }"
                :aria-label="course.title"
              >
                <span
                  class="account-page__course-icon"
                  aria-hidden="true"
                >
                  <BookOpen :size="18" />
                </span>
                <span class="account-page__course-info">
                  <span class="account-page__course-title">{{
                    course.title
                  }}</span>
                  <span class="account-page__course-meta">{{
                    course.teacher
                  }}</span>
                </span>
                <span class="account-page__course-figure">
                  <span class="account-page__course-value"
                    >{{ course.completedLabs }} / {{ course.totalLabs }}</span
                  >
                  <span class="account-page__course-meta"
                    >лабораторных сдано</span
                  >
                </span>
                <ChevronRight
                  class="account-page__course-arrow"
                  :size="18"
                />
              </RouterLink>
            </li>
          </ul>
        </template>

        <template v-else>
          <p
            v-if="taughtCourses.length === 0"
            class="account-page__empty"
          >
            Дисциплин пока нет.
          </p>
          <!-- TODO: строки станут ссылками, когда появится страница дисциплины для преподавателя -->
          <ul
            v-else
            class="account-page__courses"
          >
            <li
              v-for="course in taughtCourses"
              :key="course.id"
              class="account-page__card account-page__course"
            >
              <span
                class="account-page__course-icon"
                aria-hidden="true"
              >
                <BookOpen :size="18" />
              </span>
              <span class="account-page__course-info">
                <span class="account-page__course-title">{{
                  course.title
                }}</span>
                <span class="account-page__course-meta"
                  >Группы: {{ course.groups.join(', ') }}</span
                >
              </span>
              <span class="account-page__course-figure">
                <span
                  class="account-page__course-value"
                  :class="{
                    'account-page__course-value--muted':
                      course.pendingReviews === 0,
                  }"
                  >{{ course.pendingReviews }}</span
                >
                <span class="account-page__course-meta">ждут проверки</span>
              </span>
            </li>
          </ul>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;

  /* колонки перестраиваются по ширине страницы: часть окна занимает меню */
  container: account-page / inline-size;
}

.account-page__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.account-page__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  padding: 0;
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.account-page__back:hover {
  color: var(--color-text);
}

.account-page__title {
  margin: 0;
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.account-page__status {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--nav-item-height);
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.account-page__status--error {
  color: var(--color-error);
}

.account-page__retry {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.account-page__content {
  display: grid;
  align-items: start;
  gap: 1.5rem;
  grid-template-columns: minmax(20rem, 22.5rem) minmax(0, 1fr);
}

.account-page__column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.account-page__section-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 700;
  text-transform: uppercase;
}

.account-page__card {
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.account-page__profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.account-page__identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.account-page__avatar {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 4rem;
  height: 4rem;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-accent-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.account-page__identity-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
}

.account-page__name {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

/* бейдж обрамляет одну строку текста — отступы в em */
.account-page__role {
  padding: 0.25em 0.75em;
  border-radius: 1em;
  background-color: var(--color-accent-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.account-page__details {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.account-page__detail {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.account-page__detail-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.account-page__detail-value {
  min-width: 0;
  font-size: var(--font-size-lg);
  font-weight: 500;

  /* в почте нет пробелов — без этого длинный адрес вылезет из карточки */
  overflow-wrap: anywhere;
}

.account-page__actions {
  display: flex;
  gap: 0.5rem;
}

/* кнопка обрамляет одну строку текста — отступы в em */
.account-page__action {
  display: inline-flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em 1em;
  border: 1px solid var(--color-border);
  border-radius: 0.75em;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
}

.account-page__action--primary {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
  color: var(--color-surface);
}

.account-page__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.account-page__stats {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.account-page__stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.125rem;
}

.account-page__stat-label {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.account-page__stat-value {
  margin: 0;
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1.1;
}

.account-page__stat-value--accent {
  color: var(--color-success);
}

.account-page__stat-hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.account-page__courses {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.account-page__course {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  color: var(--color-text);
  text-decoration: none;
}

.account-page__course--link {
  transition: border-color 0.2s ease;
}

.account-page__course--link:hover {
  border-color: var(--color-accent);
}

.account-page__course-icon {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  background-color: var(--color-muted-surface);
  color: var(--color-text-secondary);
}

.account-page__course-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.account-page__course-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;

  /* длинное слово переносим по слогам (страница lang="ru"), а не в любом месте */
  hyphens: auto;
  overflow-wrap: break-word;
}

.account-page__course-meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  overflow-wrap: anywhere;
}

.account-page__course-figure {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  white-space: nowrap;
}

.account-page__course-value {
  color: var(--color-accent);
  font-size: var(--font-size-3xl);
  font-weight: 700;
}

.account-page__course-value--muted {
  color: var(--color-text-secondary);
}

.account-page__course-arrow {
  color: var(--color-text-secondary);
}

.account-page__empty {
  margin: 0;
  padding: 1.5rem 1.375rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

/* двум колонкам тесно */
@container account-page (width < 46rem) {
  .account-page__content {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* совсем узко */
@container account-page (width < 28rem) {
  .account-page__stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .account-page__actions {
    flex-direction: column;
  }

  .account-page__course {
    flex-wrap: wrap;
  }

  .account-page__course-figure {
    flex-direction: row;
    align-items: baseline;
    gap: 0.5rem;
    width: 100%;
    padding-left: 3.5rem;
  }
}
</style>
