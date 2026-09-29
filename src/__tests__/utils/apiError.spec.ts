import { describe, expect, it } from 'vitest';

import { getApiErrorMessage } from '@/utils/apiError.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

describe('getApiErrorMessage', () => {
  it('возвращает текст ApiRequestError', () => {
    expect(getApiErrorMessage(new ApiRequestError(404, 'Не найдено'))).toBe(
      'Не найдено',
    );
  });

  it('для прочих ошибок возвращает общее сообщение', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe(
      'Не удалось загрузить данные',
    );
  });
});
