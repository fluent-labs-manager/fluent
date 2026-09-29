import { ApiRequestError } from '@/utils/ApiResolver.ts';

const FALLBACK_MESSAGE = 'Не удалось загрузить данные';

// ошибка запроса - в текст для пользователя
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    // TODO: обработать 401 — отправить пользователя на вход через ITMO ID.
    return error.message;
  }
  return FALLBACK_MESSAGE;
}
