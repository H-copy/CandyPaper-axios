import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosStatic } from 'axios'
import { Interceptor } from '../interceptor'
import { asserts } from '../utils'

export interface CandyPaperInstall{
  (candy: CandyPaper): void
}

export type CandyPaperUse = { install: CandyPaperInstall } | CandyPaperInstall 

export class CandyPaper{

  static axios?: AxiosStatic

  static withAxios(axios: AxiosStatic) {
    CandyPaper.axios = axios
  }
  
  candy?: AxiosInstance

  interceptor = {
    request: new Interceptor<AxiosRequestConfig>(),
    response: new Interceptor<AxiosResponse>()
  }   

  /**
   * @param config axios实例 or axios配置对象
   * @example
   * 1. new CandyPaper({ baseUrl: '/' })
   * 2. new CandyPaper(axios.create({baseUrl: '/'}))
   */
  
  constructor(config?: AxiosInstance)
  constructor(config?: AxiosRequestConfig)
  constructor(config?: AxiosRequestConfig | AxiosInstance){
    if(asserts.isFunction(config)){
      this.candy = config
    }else if(CandyPaper.axios){
      this.candy = CandyPaper.axios.create(config)
    }
  }

  // 重组请求拦截器列表
  protected resetInterceptors(ctx: AxiosRequestConfig, candy: AxiosInstance){
    
    const interceptorRequests = candy.interceptors.request.handlers.filter(i => !i.key)
    const interceptorResponses = candy.interceptors.response.handlers.filter(i => !i.key)
    const requestOnceList = ctx?.$interceptor?.request || []
    const responseOnceList = ctx?.$interceptor?.response || []
    
    requestOnceList.forEach(i => this.interceptor.request.useOnce(i))
    responseOnceList.forEach(i => this.interceptor.response.useOnce(i))

    const middleRequests  = this.interceptor.request.queupUp(ctx)
    candy.interceptors.request.handlers = [
      ...interceptorRequests,
      ...middleRequests
    ].sort(() => -1) // 反序, 保证执行顺序与注册顺序一致
    
    const middleResponses = this.interceptor.response.queupUp(ctx)
    candy.interceptors.response.handlers = [
      ...interceptorResponses,
      ...middleResponses
    ]
  }
  
  // 统一挂载接口
  use(plugin: CandyPaperUse){

    if(asserts.isFunction(plugin)){
      plugin(this)
    }else if(asserts.isObject(plugin)){
      plugin.install(this)
    }
    
    return this
  }

  request(options: AxiosRequestConfig){
    if(!this.candy){
      throw new Error(`未注册axios对象, 使用CandyPaper.withAxios(AxiosStatic), 或创建时传入axios实例`)
    }
    this.resetInterceptors(options, this.candy)
    return this.candy(options)
  }

  get<T>(url: string, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'> ){
    return this.request({
      url,
      method: 'get',
      ...options
    })
  }

  post<T>(url: string, data?:T, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'post',
      data,
      ...options
    })
  }

  put<T>(url: string, data?:T,  options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'put',
      data,
      ...options
    })
  }

  patch<T>(url: string, data?: T, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'patch',
      data,
      ...options
    })
  }

  delete<T>(url: string, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'delete',
      ...options
    })
  }
  
  options<T>(url: string, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'options',
      ...options
    })
  }

  head<T>(url: string, options?: Omit<AxiosRequestConfig<T>, 'url' | 'method'>) {
    return this.request({
      url,
      method: 'head',
      ...options
    })
  }
  
}