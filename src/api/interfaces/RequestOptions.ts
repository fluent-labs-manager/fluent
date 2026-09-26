import type { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  url: string;
  method: string;
  data?: unknown;
  jwt?: string;
  responseType?: AxiosRequestConfig['responseType'];
  customHeaders?: Record<string, string>;
}
