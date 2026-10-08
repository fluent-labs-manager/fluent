import type { Lab } from '@/api/labs/Lab.dto.ts';
import { LabStatus } from '@/types/LabStatus.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

// данные для заглушки из src/api/labs/LabsApi.ts. Ключ — id дисциплины из
// src/mocks/courses.ts, у дисциплин без записи лабораторных нет
export const courseLabs: Partial<Record<number, Lab[]>> = {
  1: [
    {
      id: 101,
      number: 1,
      title: 'Концептуальное ТЗ',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-10-05T23:59:00+03:00'),
      grade: 4.2,
      submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
    },
    {
      id: 102,
      number: 2,
      title: 'Создание пользовательских интерфейсов',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
      variant: 42,
    },
    {
      id: 103,
      number: 3,
      title: 'Интеграция API',
      status: LabStatus.Locked,
      deadline: toIsoDateTime('2026-10-29T23:59:00+03:00'),
    },
  ],
  // две работы можно выполнять одновременно
  2: [
    {
      id: 201,
      number: 1,
      title: 'Перцептрон Розенблатта',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-09-22T23:59:00+03:00'),
      grade: 5,
      submittedAt: toIsoDateTime('2026-09-20T12:00:00+03:00'),
    },
    {
      id: 202,
      number: 2,
      title: 'Градиентный спуск',
      status: LabStatus.PendingReview,
      deadline: toIsoDateTime('2026-10-06T23:59:00+03:00'),
      submittedAt: toIsoDateTime('2026-10-04T21:15:00+03:00'),
    },
    {
      id: 203,
      number: 3,
      title: 'Обучение многослойного перцептрона',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-10-20T23:59:00+03:00'),
      variant: 7,
    },
    {
      id: 204,
      number: 4,
      title: 'Свёрточные сети',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-11-03T23:59:00+03:00'),
      variant: 19,
    },
  ],
  // все работы сданы — активных нет
  3: [
    {
      id: 301,
      number: 1,
      title: 'Процессы и потоки',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-09-18T23:59:00+03:00'),
      grade: 5,
      submittedAt: toIsoDateTime('2026-09-17T16:40:00+03:00'),
    },
    {
      id: 302,
      number: 2,
      title: 'Планировщик задач',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-10-02T23:59:00+03:00'),
      grade: 4.8,
      submittedAt: toIsoDateTime('2026-10-01T11:05:00+03:00'),
    },
  ],
  // три работы можно выполнять одновременно
  4: [
    {
      id: 401,
      number: 1,
      title: 'Проектирование схемы данных',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-09-15T23:59:00+03:00'),
      grade: 4.7,
      submittedAt: toIsoDateTime('2026-09-14T19:20:00+03:00'),
    },
    {
      id: 402,
      number: 2,
      title: 'Нормализация',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-09-25T23:59:00+03:00'),
      grade: 5,
      submittedAt: toIsoDateTime('2026-09-24T15:45:00+03:00'),
    },
    {
      id: 403,
      number: 3,
      title: 'SQL-запросы',
      status: LabStatus.Submitted,
      deadline: toIsoDateTime('2026-10-03T23:59:00+03:00'),
      grade: 4.4,
      submittedAt: toIsoDateTime('2026-10-02T22:10:00+03:00'),
    },
    {
      id: 404,
      number: 4,
      title: 'Индексы и планы выполнения запросов',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-10-18T23:59:00+03:00'),
      variant: 12,
    },
    {
      id: 405,
      number: 5,
      title: 'Транзакции',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-10-28T23:59:00+03:00'),
      variant: 31,
    },
    {
      id: 406,
      number: 6,
      title: 'Хранимые процедуры и триггеры',
      status: LabStatus.NotSubmitted,
      deadline: toIsoDateTime('2026-11-10T23:59:00+03:00'),
      variant: 5,
    },
  ],
};
