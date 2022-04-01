import type { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios'
import type { AxiosInterceptor, CandyInterceptor } from '../../common'
import { CandyPaper } from '../../core'
import { dataToString, LStorage, StorageType, asserts } from '../../utils'


export const DEF_CACHE_KEY = 'cache'

function defSaveKey(){
  return new Date().getTime() + (Math.random() * 100).toFixed(0)
}


/**
 * 缓存仓库定义
 */
export interface ICache<D = any> {
  // 缓存
  save(data: D, k?: IndexKey): IndexKey
  // 取出
  take(k: IndexKey): D
  // 删除
  delete(k: IndexKey): void
  // 判断
  has(k: IndexKey): boolean
}


/**
 * 基于map的缓存
 */
export class CacheByMap<T = any> implements ICache {
  protected _store  = new Map<IndexKey, any>() 
  creatSaveKey: (ctx?: T) => IndexKey = defSaveKey

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
 * 基于map的缓存
 */
export class CacheByStorage<T = any> implements ICache {
  protected _store: LStorage

  creatSaveKey: (ctx?: T) => string = defSaveKey

  constructor(type?: StorageType){
    this._store = new LStorage(type)
  }

  save<V = T>(data?: V, key?: string){
    key = key || this.creatSaveKey()
    this._store.$setItem(key, data)
    return key
  }
  
  take(key: string){
    return this._store.$getItem(key)
  }

  delete(key: string){
    if(!this.has(key)){
      return
    }
    this._store.$delete(key)
  }

  has(key: string){
    return this._store.$getItem(key) !== undefined
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


export class Cache<T = AxiosRequestConfig>{

  protected _cache: ICache = new CacheByMap<T>()
  protected _emptyFlag = 'cacheEmptyFlag'

  creatSaveKey = defInterceptorSaveKey
  constructor(cache?: ICache<T>){
    this._cache = cache || this._cache
  }

  /**
   * 缓存拦截器入口
   * @summary
   * 1. 判断是否存在缓存
   * 2. 无缓存，向仓库中追加空值占位
   * 3. 有缓存，修改请求适配器(跳过请求)，将缓存返回。
   */
  adapterIn(){
    return (ctx: AxiosRequestConfig) => {
      const key = this.creatSaveKey(ctx)
      if(ctx.$cache === undefined){
        return ctx
      }

      if(asserts.isNumber(ctx.$cache)){
        const timeDiff = new Date().getTime() - ctx.$cache
        if(timeDiff <= 0){
          this._cache.delete(key)
          return ctx
        }
      }
      
      const _d = this._cache.take(key)
      if(_d && _d !== this._emptyFlag){
        // 替换真实请求
        ctx.adapter = () => Promise.resolve(_d)
      }else{
        // 可缓存标记
        this._cache.save(this._emptyFlag, key)
      }
      return ctx
    }
  }
  
  /**
   * 缓存出口
   * @summary
   * 判断是否存在且为空值占位符,
   * 如果为空值占位符缓存请求数据, 供 adapterIn 使用
   */
  adapterOut(){
    return (ctx: AxiosResponse) => {
      const key = this.creatSaveKey(ctx.config)
      const _d = this._cache.take(key)
      if(ctx.config.$cache && _d === this._emptyFlag){
        this._cache.save(ctx, key)
      }
      return ctx
    }
  }
}


// axios 接口适配
export class CacheForAxios<T> extends Cache<T>{

  static create<T>(cache?: ICache<T>) {
    return new CacheForAxios(cache)
  }
  
  constructor(cache?: ICache<T>) {
    super(cache)
  }
  
  install(axios: AxiosInstance){
    axios.interceptors.request.use(
      this.adapterIn()
    )

    axios.interceptors.response.use(
      this.adapterOut()
    )
  }
  
}

// candyPaper 接口适配
export class CacheForCandyPaper<T> extends Cache<T>{
  
  static create<T>(cache?: ICache<T>) {
    return new CacheForCandyPaper(cache)
  }
  
  installKey:IndexKey = DEF_CACHE_KEY

  constructor(cache?: ICache<T>) {
    super(cache)
  }

  install(candyPaper: CandyPaper){
    candyPaper.interceptor.request.use(
      this.installKey,
      this.adapterIn()
    )
    candyPaper.interceptor.response.use(
      this.installKey,
      this.adapterOut()
    )
  }
}


export const cahceForPromise = <T>(cache: ICache<T>) => <A>(key:string, api: (...args: A[]) => Promise<T>) => {
  return (...args: A[]) => {
      if (cache.has(key)) {
        return cache.take(key)
      }
      
      return  api.apply(api, args).then(d => {
        cache.save(d, key)
        return d
      })
    }
}