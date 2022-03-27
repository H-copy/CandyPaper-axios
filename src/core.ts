import axios from 'axios'
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import { Interceptor, InterceptorOptions } from './interceptor'
import { is } from 'ramda'

axios.interceptors.request
axios.interceptors.response

export class CandyPaper{

  candy: AxiosInstance

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
    this.candy =  is(Function, config) ? config : axios.create(config)
  }

  // 重组请求拦截器列表
  protected resetInterceptors(ctx: InterceptorOptions){
    const interceptorRequests = this.candy.interceptors.request.handlers.filter(i => !i.key)
    const interceptorResponses = this.candy.interceptors.response.handlers.filter(i => !i.key)

    const middleRequests  = this.interceptor.request.queupUp(ctx).sort(() => -1)
    this.candy.interceptors.request.handlers = [
      ...interceptorRequests,
      ...middleRequests
    ].sort(() => -1)
    
    const middleResponses = this.interceptor.response.queupUp(ctx)
    this.candy.interceptors.response.handlers = [
      ...interceptorResponses,
      ...middleResponses
    ]
  }

  request(options: AxiosRequestConfig){
    this.resetInterceptors(options)
    return this.candy(options)
  }
  
}