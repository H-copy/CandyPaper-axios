import { AxiosRequestConfig, AxiosInterceptorManager } from 'axios'

declare module 'axios'{

  export interface AxiosRequestConfig{
    $cache?: number | boolean
    $intercepteFilter?: (keys: IndexKey[]) => IndexKey[]
  }

  export type Fulfilled<T = any> = (d: T) => T | Promise<T>
  export type Rejected = (err: any) => any
  export type RunWhen = (conf:AxiosRequestConfig) => boolean | null
  
  export interface InterceptorHandler<V>{
    key?: IndexKey
    fulfilled: Fulfilled<V>
    rejected?: Rejected
    runWhen?: RunWhen
  }

  export interface AxiosInterceptorManager<V>{
    handlers: InterceptorHandler<V>[]
  }
  
}