import type { AxiosRequestConfig } from 'axios';

export interface RequestConfig<T> extends AxiosRequestConfig {
  data?: T;
}
