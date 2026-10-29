import type { LabSubmissionDetails } from '@/api/labs/LabSubmission.dto.ts';

export const mockLabSubmission: LabSubmissionDetails = {
  labId: 3,
  labTitle: 'Лабораторная работа 3',
  status: 'in_review',
  currentFile: {
    name: 'gorelova.pdf',
    size: '2.4 МБ',
    uploadedAt: 'сегодня в 09:30',
    url: '#',
  },
  studentComment: 'Добавила реализацию валидации и e2e тесты.',
  attempts: [
    {
      id: 2,
      attemptNumber: 2,
      date: '18.10.2026',
      comment: '«Бред полный пу пу пу»',
      status: 'rejected',
      fileName: 'gorelova_v1.pdf',
      fileSize: '1.9 МБ',
      fileUrl: '#',
    },
    {
      id: 1,
      attemptNumber: 1,
      date: '18.09.2026',
      comment: '«Бред полный пу пу пу»',
      status: 'rejected',
      fileName: 'gorelova_v1.pdf',
      fileSize: '1.9 МБ',
      fileUrl: '#',
    },
  ],
};
