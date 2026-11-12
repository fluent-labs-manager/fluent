import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStudentEventsStub } from '@/api/events/EventsApi.ts';
import { MOCK_DELAY_MS } from '@/mocks/mockMode.ts';
import { ApiRequestError } from '@/utils/ApiResolver.ts';

describe('EventsApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  async function request(search = ''): Promise<unknown> {
    window.history.replaceState(null, '', `/events${search}`);
    const settled = getStudentEventsStub().then(
      (value) => value,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);
    return settled;
  }

  it('возвращает список событий по умолчанию', async () => {
    const data = (await request()) as { events: unknown[] };
    expect(data.events.length).toBeGreaterThan(0);
  });

  it('с ?mock=empty возвращает пустой список событий', async () => {
    const data = (await request('?mock=empty')) as { events: unknown[] };
    expect(data.events).toEqual([]);
  });

  it('с ?mock=error бросает ApiRequestError', async () => {
    expect(await request('?mock=error')).toBeInstanceOf(ApiRequestError);
  });
});
