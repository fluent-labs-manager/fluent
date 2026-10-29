import type { ReviewQueueItem } from '@/api/labs/ReviewQueue.dto.ts';

export const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: 1,
    studentName: 'Ульяна Горелова',
    studentGroup: 'P3322',
    courseId: 1,
    courseTitle: 'Разработка веб-приложений',
    labNumber: 3,
    labTitle: 'Интеграция API и тесты',
    submittedAt: 'сегодня в 09:30',
  },
  {
    id: 2,
    studentName: 'Иван Иванов',
    studentGroup: 'P3322',
    courseId: 1,
    courseTitle: 'Разработка веб-приложений',
    labNumber: 2,
    labTitle: 'Создание интерфейсов',
    submittedAt: 'вчера в 18:40',
  },
  {
    id: 3,
    studentName: 'Алексей Смирнов',
    studentGroup: 'P3312',
    courseId: 6,
    courseTitle: 'Проектирование интерфейсов',
    labNumber: 1,
    labTitle: 'Концептуальное проектирование',
    submittedAt: '12 октября',
  },
];
