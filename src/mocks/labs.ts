import type { CourseLabs } from '@/api/labs/CourseLabs.dto.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

// данные для заглушки из src/api/labs/LabsApi.ts. Ключ — id дисциплины из
// src/mocks/courses.ts, у дисциплин без записи лабораторных нет
export const courseLabs: Partial<Record<number, Omit<CourseLabs, 'course'>>> = {
  1: {
    activeLab: {
      id: 102,
      number: 2,
      title: 'Создание пользовательских интерфейсов',
      deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
      variant: 42,
    },
    labs: [
      {
        id: 101,
        number: 1,
        title: 'Концептуальное ТЗ',
        status: 'submitted',
        deadline: toIsoDateTime('2026-10-05T23:59:00+03:00'),
        grade: 4.2,
        submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
      },
      {
        id: 102,
        number: 2,
        title: 'Создание ПИ',
        status: 'not-submitted',
        deadline: toIsoDateTime('2026-10-15T23:59:00+03:00'),
      },
      {
        id: 103,
        number: 3,
        title: 'Интеграция API',
        status: 'locked',
        deadline: toIsoDateTime('2026-10-29T23:59:00+03:00'),
      },
    ],
  },
  2: {
    activeLab: {
      id: 203,
      number: 3,
      title: 'Обучение многослойного перцептрона',
      deadline: toIsoDateTime('2026-10-20T23:59:00+03:00'),
      variant: 7,
    },
    labs: [
      {
        id: 201,
        number: 1,
        title: 'Перцептрон Розенблатта',
        status: 'submitted',
        deadline: toIsoDateTime('2026-09-22T23:59:00+03:00'),
        grade: 5,
        submittedAt: toIsoDateTime('2026-09-20T12:00:00+03:00'),
      },
      {
        id: 202,
        number: 2,
        title: 'Градиентный спуск',
        status: 'pending-review',
        deadline: toIsoDateTime('2026-10-06T23:59:00+03:00'),
        submittedAt: toIsoDateTime('2026-10-04T21:15:00+03:00'),
      },
      {
        id: 203,
        number: 3,
        title: 'Многослойный перцептрон',
        status: 'not-submitted',
        deadline: toIsoDateTime('2026-10-20T23:59:00+03:00'),
      },
      {
        id: 204,
        number: 4,
        title: 'Свёрточные сети',
        status: 'locked',
        deadline: toIsoDateTime('2026-11-03T23:59:00+03:00'),
      },
    ],
  },
  3: {
    // все работы сданы — активной нет
    activeLab: null,
    labs: [
      {
        id: 301,
        number: 1,
        title: 'Процессы и потоки',
        status: 'submitted',
        deadline: toIsoDateTime('2026-09-18T23:59:00+03:00'),
        grade: 5,
        submittedAt: toIsoDateTime('2026-09-17T16:40:00+03:00'),
      },
      {
        id: 302,
        number: 2,
        title: 'Планировщик задач',
        status: 'submitted',
        deadline: toIsoDateTime('2026-10-02T23:59:00+03:00'),
        grade: 4.8,
        submittedAt: toIsoDateTime('2026-10-01T11:05:00+03:00'),
      },
    ],
  },
};
