import type { AxiosRequestConfig } from 'axios';
import type { AllowedHttpMethods } from '@/utils/types/ApiResolver';

export interface RequestOptions {
  url: string;
  method: AllowedHttpMethods;
  data?: unknown;
  jwt?: string;
  timeout?: number;
  responseType?: AxiosRequestConfig['responseType'];
  customHeaders?: Record<string, string>;
}
