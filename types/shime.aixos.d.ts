import { AxiosRequestConfig, AxiosInterceptorManager } from 'axios'

declare module 'axios'{

  export interface AxiosRequestConfig{
    $cache?: number | boolean
    $intercepteFilter?: (keys: IndexKey[]) => IndexKey[]
    $interceptor?: {
      request?: InterceptorHandler<AxiosRequestConfig>[]
      response?: InterceptorHandler<AxiosResponse>[]
    }
  }

  interface Fulfilled<T = any>{
    (d: T): T | Promise<T>
    key?: IndexKey
  }

  interface Rejected{
    (err: any): any
    key?: IndexKey
  }
  
  export type RunWhen = (conf:AxiosRequestConfig) => boolean | null
  
  export interface InterceptorHandler<V>{
    key?: IndexKey
    $once?: boolean
    fulfilled: Fulfilled<V>
    rejected?: Rejected
    runWhen?: RunWhen
  }


  export interface AxiosInterceptorManager<V>{
    handlers: InterceptorHandler<V>[]
  }
  
}