import { Interceptor }  from './interceptor'

import type {
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'



export interface AxiosInterceptor {
  request: AxiosInterceptorManager<AxiosRequestConfig>;
  response: AxiosInterceptorManager<AxiosResponse>;
}

export interface CandyInterceptor{
  request: Interceptor<AxiosRequestConfig>,
  response: Interceptor<AxiosResponse>
}
