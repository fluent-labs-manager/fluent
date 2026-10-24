import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '@/constants/labSubmission.ts';
import { formatFileSize, getFileType } from '@/utils/FileFormatter.ts';

const allowedTypes = ALLOWED_FILE_EXTENSIONS.map((extension) =>
  extension.toUpperCase(),
);

// проверка файла перед отправкой: текст ошибки или null, если файл подходит.
// окно выбора только подсказывает типы, а при перетаскивании их никто не проверяет
export function validateSubmissionFile(file: File): string | null {
  if (!allowedTypes.includes(getFileType(file.name))) {
    return `Этот тип файла не принимается. Можно: ${allowedTypes.join(', ')}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Файл больше ${formatFileSize(MAX_FILE_SIZE_BYTES)}`;
  }
  return null;
}
