import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import ApiResolver from '@/utils/ApiResolver.ts';
import testApiConf from '@/api/test.api.conf.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('ApiResolverUtil', () => {
  let resolver: ApiResolver;

  beforeEach(() => {
    resolver = new ApiResolver('users', testApiConf.apiUrl);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------
  // request
  // ------------------------------------------------------------
  describe('request', () => {
    it('использует endpoint из конфигурации по умолчанию и возвращает данные', async () => {
      const responseData = { id: 1, name: 'Ivan' };
      mockedAxios.mockResolvedValueOnce({
        data: responseData,
      });

      const result = await resolver.request<typeof responseData>({
        url: 'profile',
        method: 'GET',
      });

      expect(result).toEqual(responseData);
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${testApiConf.apiUrl}/users/profile`,
          method: 'GET',
          responseType: 'json',
          headers: {},
        }),
      );
    });

    it('использует переданный в конструктор endpoint', async () => {
      const customResolver = new ApiResolver('users', 'https://custom.api');
      mockedAxios.mockResolvedValueOnce({ data: {} });

      await customResolver.request({ url: 'profile', method: 'GET' });

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://custom.api/users/profile',
        }),
      );
    });

    it('передаёт тело, тип ответа и пользовательские заголовки', async () => {
      const data = { query: 'developer' };
      mockedAxios.mockResolvedValueOnce({ data: {} });

      await resolver.request({
        url: 'search',
        method: 'POST',
        data,
        responseType: 'blob',
        customHeaders: { 'X-Request-Id': 'request-1' },
      });

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data,
          responseType: 'blob',
          headers: { 'X-Request-Id': 'request-1' },
        }),
      );
    });

    it('добавляет Authorization для непустого jwt и не добавляет для пустого', async () => {
      mockedAxios.mockResolvedValueOnce({ data: {} });
      await resolver.request({
        url: 'profile',
        method: 'GET',
        jwt: 'token',
        customHeaders: { 'X-Client': 'web' },
      });

      expect(mockedAxios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          headers: { Authorization: 'Bearer token', 'X-Client': 'web' },
        }),
      );

      mockedAxios.mockResolvedValueOnce({ data: {} });
      await resolver.request({ url: 'profile', method: 'GET', jwt: '' });

      expect(mockedAxios).toHaveBeenLastCalledWith(
        expect.objectContaining({ headers: {} }),
      );
    });

    it('возвращает status и сообщение Axios-ошибки', async () => {
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.mockRejectedValueOnce({
        message: 'Request failed',
        response: { status: 404, data: { message: 'ERROR: Not found' } },
      });

      const result = await resolver.request<{
        status: number;
        message: string;
      }>({
        url: 'missing',
        method: 'GET',
      });

      expect(result).toEqual({ status: 404, message: ' Not found' });
    });

    it('берёт status из тела Axios-ошибки и fallback message', async () => {
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.mockRejectedValueOnce({
        message: 'Network Error',
        response: { data: { status: 418, message: 123 } },
      });

      const result = await resolver.request<{
        status: number;
        message: string;
      }>({
        url: 'teapot',
        method: 'GET',
      });

      expect(result).toEqual({ status: 418, message: 'Network Error' });
    });

    it('возвращает неизвестную ошибку, если ошибка не от Axios', async () => {
      mockedAxios.isAxiosError.mockReturnValue(false);
      mockedAxios.mockRejectedValueOnce(new Error('Unexpected failure'));

      const result = await resolver.request<{
        status: number;
        message: string;
      }>({
        url: 'profile',
        method: 'GET',
      });

      expect(result).toEqual({ status: 500, message: 'Неизвестная ошибка' });
    });
  });

  describe('DTOToFormData', () => {
    it('преобразует свойства DTO в FormData', () => {
      const formData = resolver.DTOToFormData({
        name: 'Ivan',
        role: 'developer',
      } as never);

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('name')).toBe('Ivan');
      expect(formData.get('role')).toBe('developer');
    });

    it('создаёт пустой FormData для пустого DTO', () => {
      const formData = resolver.DTOToFormData({} as never);

      expect([...formData.entries()]).toEqual([]);
    });
  });

  describe('DTOToURLSearchParams', () => {
    it('преобразует допустимые свойства DTO в URLSearchParams', () => {
      const params = resolver.DTOToURLSearchParams({
        query: 'vue',
        page: '2',
      } as never);

      expect(params.toString()).toBe('query=vue&page=2');
    });

    it('пропускает значения null и undefined', () => {
      const params = resolver.DTOToURLSearchParams({
        included: 'yes',
        empty: null,
        missing: undefined,
      } as never);

      expect(params.toString()).toBe('included=yes');
    });
  });
});
