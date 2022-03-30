// import axios from 'axios'
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import { Interceptor } from './interceptor'


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
  // constructor(config?: AxiosInstance)
  // constructor(config?: AxiosRequestConfig)
  // constructor(config?: AxiosRequestConfig | AxiosInstance){
  //   this.candy =  is(Function, config) ? config : axios.create(config)
  // }

  constructor(axiosInstance: AxiosInstance) {
    this.candy = axiosInstance
  }

  // 重组请求拦截器列表
  protected resetInterceptors(ctx: AxiosRequestConfig){
    const interceptorRequests = this.candy.interceptors.request.handlers.filter(i => !i.key)
    const interceptorResponses = this.candy.interceptors.response.handlers.filter(i => !i.key)
    const requestOnceList = ctx?.$interceptor?.request || []
    const responseOnceList = ctx?.$interceptor?.response || []
    
    requestOnceList.forEach(i => this.interceptor.request.useOnce(i))
    responseOnceList.forEach(i => this.interceptor.response.useOnce(i))

    const middleRequests  = this.interceptor.request.queupUp(ctx)
    this.candy.interceptors.request.handlers = [
      ...interceptorRequests,
      ...middleRequests
    ].sort(() => -1) // 反序, 保证执行顺序与注册顺序一致
    
    const middleResponses = this.interceptor.response.queupUp(ctx)
    this.candy.interceptors.response.handlers = [
      ...interceptorResponses,
      // ...responseOnceList,
      ...middleResponses
    ]
  }

  request(options: AxiosRequestConfig){
    this.resetInterceptors(options)
    return this.candy(options)
  }
  
}