<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Video } from '@lucide/vue';

interface QueueStudent {
  id: number;
  name: string;
  group: string;
  labNumber: number;
  variant: number;
  status: 'done' | 'waiting';
  grade?: string;
}

const router = useRouter();

const courseTitle = ref('Разработка Веб-приложений');
const streamTitle = ref('ПОТОК 1.2');
const connectedStudentsCount = ref(14);

const students = ref<QueueStudent[]>([
  {
    id: 1,
    name: 'Горелова Ульяна',
    group: 'P3322',
    labNumber: 4,
    variant: 12,
    status: 'done',
    grade: '9 / 10',
  },
  {
    id: 2,
    name: 'Фокин Владимир',
    group: 'P3322',
    labNumber: 5,
    variant: 15,
    status: 'waiting',
  },
  {
    id: 3,
    name: 'Ярулина Алеся',
    group: 'P3322',
    labNumber: 4,
    variant: 2,
    status: 'waiting',
  },
  {
    id: 4,
    name: 'Петрова Мария',
    group: 'P3322',
    labNumber: 1,
    variant: 7,
    status: 'waiting',
  },
]);

const handleOpenStudentGrading = (student: QueueStudent): void => {
  void router.push({
    name: 'grading',
    query: {
      studentId: student.id,
      name: student.name,
      variant: student.variant,
      lab: student.labNumber,
    },
  });
};

const handleJoinCall = (): void => {
  window.open('https://telemost.yandex.ru', '_blank');
};

const handleGoBack = (): void => {
  void router.push({ name: 'home' });
};
</script>

<template>
  <main class="queue-page">
    <header class="queue-header">
      <button
        class="back-btn"
        type="button"
        @click="handleGoBack"
      >
        <ChevronLeft :size="16" />
        Назад
      </button>

      <h1 class="queue-title">{{ courseTitle }}</h1>
    </header>

    <section class="conference-banner">
      <div class="conference-info">
        <div class="conference-icon-box">
          <Video :size="20" />
        </div>
        <div class="conference-text">
          <span class="conference-title">Онлайн-конференция</span>
          <span class="conference-sub">
            Подключено: {{ connectedStudentsCount }} студентов
          </span>
        </div>
      </div>

      <button
        class="join-btn"
        type="button"
        @click="handleJoinCall"
      >
        Войти
      </button>
    </section>

    <section class="queue-section">
      <span class="stream-label">{{ streamTitle }}</span>

      <ul class="students-list">
        <li
          v-for="studentItem in students"
          :key="studentItem.id"
          class="student-item"
          @click="handleOpenStudentGrading(studentItem)"
        >
          <div class="student-info">
            <span class="student-name">{{ studentItem.name }}</span>
            <span class="student-meta">
              {{
                studentItem.status === 'done'
                  ? `СДАНО · ЛР ${studentItem.labNumber} · Вариант ${studentItem.variant}`
                  : `В ОЖИДАНИИ · ЛР ${studentItem.labNumber} · Вариант ${studentItem.variant}`
              }}
            </span>
          </div>

          <div class="student-action">
            <span
              v-if="studentItem.grade"
              class="grade-badge"
            >
              {{ studentItem.grade }}
            </span>
            <ChevronRight
              v-else
              :size="20"
              class="arrow-icon"
            />
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.queue-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--page-offset-top) 2.5rem 2.5rem;
}

.queue-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.back-btn {
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

.back-btn:hover {
  color: var(--color-text);
}

.queue-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
}

.conference-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 53.75rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background-color: var(--color-accent);
  color: #fff;
}

.conference-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.conference-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background-color: rgb(255 255 255 / 15%);
}

.conference-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.conference-title {
  font-size: var(--font-size-md);
  font-weight: 700;
}

.conference-sub {
  color: rgb(255 255 255 / 80%);
  font-size: var(--font-size-xs);
}

.join-btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.join-btn:hover {
  opacity: 0.9;
}

.queue-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 53.75rem;
}

.stream-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.student-item:hover {
  border-color: var(--color-accent);
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-name {
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.student-meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.student-action {
  display: flex;
  align-items: center;
}

.grade-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--color-muted-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.arrow-icon {
  color: var(--color-text-secondary);
}
</style>
