import type { LabAttempt } from '@/api/labs/LabAttempt.dto.ts';
import { AttemptResult } from '@/types/AttemptResult.ts';
import { toIsoDateTime } from '@/utils/IsoDateTime.ts';

// данные для заглушки из src/api/labs/LabsApi.ts. Ключ — id работы из
// src/mocks/labs.ts; у работ без записи попыток ещё не было
export const labAttempts: Partial<Record<number, LabAttempt[]>> = {
  // приняли с первой попытки
  101: [
    {
      id: 1011,
      number: 1,
      submittedAt: toIsoDateTime('2026-10-12T18:30:00+03:00'),
      file: { name: 'gorelova_tz.pdf', size: 865_280 },
      comment: null,
      teacherComment: 'Требования описаны полно, принято.',
      result: AttemptResult.Accepted,
    },
  ],
  // дважды вернули на доработку — работа снова «Не сдано»
  102: [
    {
      id: 1021,
      number: 1,
      submittedAt: toIsoDateTime('2026-09-18T20:10:00+03:00'),
      file: { name: 'gorelova_v1.pdf', size: 1_992_294 },
      comment: 'Макет и код в одном файле.',
      teacherComment: 'Нет адаптивной вёрстки и состояний загрузки.',
      result: AttemptResult.Rejected,
    },
    {
      id: 1022,
      number: 2,
      submittedAt: toIsoDateTime('2026-10-18T09:30:00+03:00'),
      file: { name: 'gorelova_v2.pdf', size: 2_516_582 },
      comment: null,
      teacherComment: 'Формы не проверяют ввод, ошибки не показываются.',
      result: AttemptResult.Rejected,
    },
  ],
  // ждёт проверки
  202: [
    {
      id: 2021,
      number: 1,
      submittedAt: toIsoDateTime('2026-10-04T21:15:00+03:00'),
      file: { name: 'gradient_descent.ipynb', size: 524_288 },
      comment: 'Графики сходимости в конце ноутбука.',
      teacherComment: null,
      result: AttemptResult.Pending,
    },
  ],
};
