export type SubmissionStatus =
  'not_submitted' | 'in_review' | 'accepted' | 'rejected';

export interface SubmissionAttempt {
  id: number;
  attemptNumber: number;
  date: string;
  comment: string;
  status: 'accepted' | 'rejected';
  fileName: string;
  fileSize: string;
  fileUrl: string;
}

export interface LabSubmissionDetails {
  labId: number;
  labTitle: string;
  status: SubmissionStatus;
  currentFile?: {
    name: string;
    size: string;
    uploadedAt: string;
    url: string;
  };
  studentComment?: string;
  attempts: SubmissionAttempt[];
}
