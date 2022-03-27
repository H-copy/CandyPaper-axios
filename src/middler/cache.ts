import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { is } from 'ramda'
import { AxiosInterceptor } from '../common'
import { dataToString } from '../utils'

function defSaveKey(){
  return new Date().getTime() + (Math.random() * 100).toFixed(0)
}

export interface ICache<D = any> {
  save(data: D, k: IndexKey): IndexKey
  take(k: IndexKey): D
  delete(k: IndexKey): void
  has(k: IndexKey): boolean
}

export class CacheByMap<T = any>{
  protected _store  = new Map<IndexKey, any>() 
  creatSaveKey: (ctx?: T) => IndexKey

  constructor(creatSaveKey: (ctx?: T) => IndexKey = defSaveKey){
    this.creatSaveKey = creatSaveKey
  }

  save<V = T>(data?: V, key?: IndexKey){
    key = key || this.creatSaveKey()
    this._store.set(key, data)
    return key
  }
  
  take(key: IndexKey){
    return this.has(key) ? this._store.get(key) : undefined
  }

  delete(key: IndexKey){
    if(!this._store.has(key)){
      return
    }
    this._store.delete(key)
  }

  has(key: IndexKey){
    return this._store.has(key)
  }
}


/**
 * 默认缓存key生成器
 * @param ctx 执行上下文
 * @returns key
 */
export function defInterceptorSaveKey(ctx: AxiosRequestConfig){
  return dataToString({
    url: ctx.url,
    params: ctx.params,
    data: ctx.data
  })
}

export class CacheForAxios<T = AxiosRequestConfig>{

  protected _cache: ICache = new CacheByMap<T>()

  creatSaveKey = defInterceptorSaveKey
  constructor(cache?: ICache<T>){
    this._cache = cache || this._cache
  }

  adapterIn(){
    return (ctx: AxiosRequestConfig) => {
      const key = this.creatSaveKey(ctx)
      if(ctx.$cache === undefined){
        return ctx
      }

      if(is(Number, ctx.$cache)){
        const timeDiff = new Date().getTime() - ctx.$cache
        if(timeDiff <= 0){
          this._cache.delete(key)
          return ctx
        }
      }
      
      if(this._cache.has(key)){
        // 替换真实请求
        ctx.adapter = () => Promise.resolve(this._cache.take(key))
      }else{
        // 可缓存标记
        this._cache.save(null, key)
      }

      return ctx
    }
  }

  adapterOut(){
    return (ctx: AxiosResponse) => {
      const key = this.creatSaveKey(ctx.config)
      if(this._cache.has(key)){
        this._cache.save(ctx, key)
      }
      return ctx
    }
  }

  withInterceptor(interceptor: AxiosInterceptor){
    const reqCancelKey = interceptor.request.use(
      this.adapterIn()
    )

    const resCancelKey = interceptor.response.use(
      this.adapterOut()
    )
    return [reqCancelKey, resCancelKey]
  }
  
}

