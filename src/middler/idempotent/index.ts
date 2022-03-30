import type { CancelTokenSource, CancelTokenStatic, AxiosRequestConfig, AxiosResponse, AxiosInterceptorManager } from 'axios'
import { Lmap, dataToString, asserts } from '../../utils'
import { AxiosInterceptor, CandyInterceptor } from '../../common'


export interface IdempotentOptions<T = any>{
  url?: string,
  params?: Record<string, any>,
  data?: T
}

/**
 * 默认缓存key生成器
 * @param ctx 执行上下文
 * @returns key
 */
export function defSaveKey(ctx: IdempotentOptions){
  return dataToString({
    url: ctx.url,
    params: ctx.params,
    data: ctx.data
  })
}

/**
 * 请求去重(幂等)
 * @param creatSaveKey 缓存key生成器
 * @props creatSaveKey
 * @function inPip 请求输入端
 * @function outPip 请求输出端
 * @function cancel 取消请求
 */
export class Idempotent<T = any> {

  cancelToken: CancelTokenStatic

   _map:Lmap<string, CancelTokenSource> = new Lmap()
  
  // 自定义缓存key生成器
  creatSaveKey: (ctx: T) => string

  constructor(cancelToken: CancelTokenStatic, creatSaveKey?: (ctx: T) => string){
    this.cancelToken = cancelToken
    this.creatSaveKey = creatSaveKey || defSaveKey
  }
  
  /**
   * 输入端
   * @summary
   * 1. 清理重复请求
   * 2. 注册新请求
   * 3. 返回注册source
   * @param ctx
   * @param message
   * @returns source
   */
  inPip(ctx: T, message?: string){
    const key = this.creatSaveKey(ctx)
    if(this._map.has(key)){
      this.cancel(key, message || key)
    }
    const source = this.cancelToken.source()
    this._map.$set(key, source)
    return source
  }

  /**
   * 输出端
   * @summary
   * 1. 清理source
   * @param ctx
   * @param message 
   */
  outPip(ctx: T, message?: string){
    let key = ''
    if(asserts.isObject(ctx)){
      key  = this.creatSaveKey(ctx)
    }
    this.cancel(key, message)
  }

  /**
   * 取消请求并清除source
   * @param key 缓存key
   * @param message 
   */
  cancel(key: string, message?: string){
    if(!this._map.has(key)){
      return
    }
    this._map.get(key)?.cancel(message)
    this._map.$delete(key)
  }
}


/**
 * axios去重拦截器
 * @summary
 * 基于axios拦截器的封装
 * @function adapterIn 请求端拦截
 * @function adapterOut 响应端拦截
 * @function withInterceptor 拦截器绑定
 */
export class IdempotentForAxios<T = any>{
  protected idempotent: Idempotent<T>
  
  constructor(idempotent: Idempotent<T>){
    this.idempotent = idempotent
  }

  adapterIn(){
    return (ctx: AxiosRequestConfig) => {
      if(!ctx.cancelToken){
        const source = this.idempotent.inPip(ctx as any)
        ctx.cancelToken = source.token
      }
      return ctx
    }
   
  }

  adapterOut(){
    return (ctx: AxiosResponse) => {
      if(!ctx.config.cancelToken){
        this.idempotent.outPip(ctx.config as any)
      }
      return ctx
    }
  }

  withInterceptor(interceptor: AxiosInterceptor){
    const reqCancelKey = interceptor.request.use(
      this.adapterIn()
    )

    const resCancelKey = interceptor.response.use(
      this.adapterOut(),
    )
    return [reqCancelKey, resCancelKey]
  }

}


/**
 * candyPaper 去重中间件
 * @summary
 * 基于中间件模式的, 去重封装
 * @function adapterIn 请求端拦截
 * @function adapterOut 响应端拦截
 * @function withInterceptor 拦截器绑定
 */
export class IdempotentForCandyParper<T = any>{
  
  protected idempotent: Idempotent<T>
  
  constructor(idempotent: Idempotent<T>){
    this.idempotent = idempotent
    this.adapterIn.bind(this)
    this.adapterOut.bind(this)
  }

  adapterIn(){
    return (ctx: AxiosRequestConfig) => {
      if(!ctx.cancelToken){
        const source = this.idempotent.inPip(ctx as any)
        ctx.cancelToken = source.token
      }
      return ctx
    }
  }

  adapterOut(){
    return (ctx:AxiosResponse) => {
      this.idempotent.outPip(ctx.config.cancelToken as any)
      return ctx
    }
  }

  withInterceptor(interceptor: CandyInterceptor, key: IndexKey = 'idempotentForCandyParper'){
    interceptor.request.use(
      key,
      this.adapterIn()
    )
    interceptor.response.use(
      key,
      this.adapterOut(),
    )

  }
}