import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import apiConf from '../api/api.conf';
import type { ApiErrorData } from '@/api/interfaces/ApiErrorData.ts';
import type { RequestConfig } from '@/api/interfaces/RequestConfig.ts';

function isApiErrorData(value: unknown): value is ApiErrorData {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!isApiErrorData(data) || typeof data.message !== 'string') {
    return fallback;
  }

  const [, messageAfterColon] = data.message.split(':');
  return messageAfterColon ?? data.message;
}

class ApiResolverUtil {
  private readonly apiUrl: string;
  private readonly endpoint: string;

  constructor(endpoint: string, apiUrl: string = apiConf.apiUrl) {
    this.apiUrl = apiUrl;
    this.endpoint = endpoint;
  }

  async request<S>(
    url: string,
    method: string,
    data?: unknown,
    jwt?: string,
    responseType?: AxiosRequestConfig['responseType'],
    customHeaders?: Record<string, string>,
  ): Promise<S> {
    const fullUrl = `${this.apiUrl}/${this.endpoint}/${url}`;

    const headers: Record<string, string> = {};

    if (jwt !== undefined && jwt !== '') {
      headers.Authorization = `Bearer ${jwt}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    const config: RequestConfig<unknown> = {
      url: fullUrl,
      method,
      data,
      headers,
      responseType: responseType ?? 'json',
    };

    try {
      const response: AxiosResponse<S> = await axios(config);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<unknown>(error)) {
        const errorData = error.response?.data;
        const status =
          error.response?.status ??
          (isApiErrorData(errorData) && typeof errorData.status === 'number'
            ? errorData.status
            : 500);

        return {
          status,
          message: getErrorMessage(errorData, error.message),
        } as S;
      }

      return {
        status: 500,
        message: 'Неизвестная ошибка',
      } as S;
    }
  }

  DTOToFormData(dto: never): FormData {
    const formData = new FormData();
    Object.keys(dto).forEach((key) => {
      formData.append(key, dto[key]);
    });
    return formData;
  }

  DTOToURLSearchParams(dto: never): URLSearchParams {
    const params = new URLSearchParams();
    Object.keys(dto).forEach((key) => {
      const value = dto[key] as unknown;
      if (value !== null && value !== undefined) {
        params.append(key, dto[key]);
      }
    });
    return params;
  }
}

export default ApiResolverUtil;
