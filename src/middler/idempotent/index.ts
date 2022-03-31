import type {
  CancelTokenSource,
  CancelTokenStatic,
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosInstance, 
  Fulfilled
} from 'axios'
import { Lmap, dataToString, asserts } from '../../utils'
import { CandyPaper } from '../../core'


export const DEF_IDEMPOTENT_KEY = 'idempotent'

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
  static cancelToken: CancelTokenStatic
  static withCancelToken(cancelToken: CancelTokenStatic){
    Idempotent.cancelToken = cancelToken
  }

   _map:Lmap<string, CancelTokenSource> = new Lmap()
  
  // 自定义缓存key生成器
  creatSaveKey: (ctx: T) => string

  constructor(creatSaveKey?: (ctx: T) => string){
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
    if(!Idempotent.cancelToken){
      throw new Error('未绑定cancelToken对象')
    }
    const key = this.creatSaveKey(ctx)
    if(this._map.has(key)){
      this.cancel(key, message || key)
    }
    const source = Idempotent.cancelToken.source()
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
   * @param keykey
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

  install(axios: AxiosInstance){
    const reqCancelKey = axios.interceptors.request.use(
      this.adapterIn()
    )

    const resCancelKey = axios.interceptors.response.use(
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

  installKey: IndexKey = DEF_IDEMPOTENT_KEY
  static create<T>(idempotent?: Idempotent<T>){
    return new IdempotentForCandyParper(idempotent)
  }

  idempotent: Idempotent<T>
  
  constructor(idempotent?: Idempotent<T>){
    this.idempotent = idempotent || new Idempotent()
  }

  adapterIn(){
    const cb:Fulfilled = (ctx: AxiosRequestConfig) => {
      if(!ctx.cancelToken){
        const source = this.idempotent.inPip(ctx as any)
        ctx.cancelToken = source.token
      }
      return ctx
    }

    cb.key = this.installKey
    return cb
  }

  adapterOut():Fulfilled{
    const cb:Fulfilled = (ctx:AxiosResponse) => {
      this.idempotent.outPip(ctx.config.cancelToken as any)
      return ctx
    }
    cb.key = this.installKey
    return cb
  }

  install(candyPaper: CandyPaper){

    candyPaper.interceptor.request.use(
      this.adapterIn()
    )
    candyPaper.interceptor.response.use(
      this.adapterOut()
    )
  }
  
}
