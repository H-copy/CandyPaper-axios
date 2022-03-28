import { 
  AxiosRequestConfig, 
  AxiosResponse,
  InterceptorHandler,
  Fulfilled,
  Rejected,
  RunWhen,
  AxiosInterceptorManager
} from 'axios'
import { Lmap } from './utils'
import  { is } from 'ramda'

interface  InterceptorItem <T = any> extends InterceptorHandler <T> {
  key: IndexKey
}

export interface InterceptorOptions {
  $intercepteFilter?: (keys: IndexKey[]) => IndexKey[]
}

/**
 * 拦截器
 */
export class Interceptor<T = AxiosRequestConfig>{

  // 拦截器队列
  handlers: Lmap<IndexKey, InterceptorItem<T>> = new Lmap()

  // 默认拦截器id生成器
  createDefKey(){
    return new Date().getTime() + this.handlers.list.length
  }

  /**
   * 注册拦截器
   * @param key 标识符
   * @param onFulfilled 任务函数
   * @param onRejected 错误捕获
   * @exmple
   * 模式一
   * use('token',  setToken)
   * 
   * 模式二
   * use(setToken, onError)
   * 
   * 模式三
   * use('token', setToken, onError)
   * 
   * 模式四
   * use({
   *   key: 'token'
   *   onFulfilled: setToken
   *   onRejected: onError
   *   runWhen: (ctx: AxiosRequestConfig) => true
   *   $once: false 
   * })
   */
  use(key: Fulfilled<T>):Interceptor<T>
  use(key: InterceptorHandler<T>): Interceptor<T>
  use(key: IndexKey, onFulfilled: Fulfilled<T>): Interceptor<T>
  use(key: Fulfilled<T>, onFulfilled: Rejected): Interceptor<T>
  use(key: IndexKey, onFulfilled: Fulfilled<T>, onRejected: Rejected): Interceptor<T>
  use(key?: IndexKey | Fulfilled<T> | InterceptorHandler<T>,  onFulfilled?: Fulfilled, onRejected?: Rejected ){

    if(!key){
      return this
    }

    const handler = this.assembleHandler(key, onFulfilled, onRejected)
    this.handlers.$set(handler.key, handler)

    return this
  }

  /**
   * 一次性拦截器
   * @summary 
   * 使用方式与 use 一致, 挂载的拦截器在加入执行队列后移除。
   * @param key 
   */
  useOnce(key: Fulfilled<T>):Interceptor<T>
  useOnce(key: InterceptorHandler<T>): Interceptor<T>
  useOnce(key: IndexKey, onFulfilled: Fulfilled<T>): Interceptor<T>
  useOnce(key: Fulfilled<T>, onFulfilled: Rejected): Interceptor<T>
  useOnce(key: IndexKey, onFulfilled: Fulfilled<T>, onRejected: Rejected): Interceptor<T>
  useOnce(key?: IndexKey | Fulfilled<T> | InterceptorHandler<T>,  onFulfilled?: Fulfilled, onRejected?: Rejected ){
     if(!key){
      return this
    }

    const handler = this.assembleHandler(key, onFulfilled, onRejected)
    this.handlers.$set(handler.key, {
      ...handler,
      $once: true,
    })

    return this
  }

   // 构建 InterceptorHandler
  assembleHandler(key: IndexKey | Fulfilled<T> | InterceptorHandler<T>,  onFulfilled?: Fulfilled, onRejected?: Rejected ):InterceptorItem<T>{

    let once:boolean = false
    let runWhen: RunWhen | undefined
    
    if(is(Function, key)){ 
      onRejected = onFulfilled
      onFulfilled = key
      key = onFulfilled.key || this.createDefKey()
    }
    
    if(is(Object, key)){
      const options = key as InterceptorHandler<T>
      key = options.key || this.createDefKey()
      onFulfilled = options.fulfilled
      onRejected = options.rejected
      once = options.$once || once
      runWhen = options.runWhen
    }
    
    if(this.handlers.has(key)){
      throw new Error(`拦截器已注册: ${String(key)}`)
    }

    if(!onFulfilled){
      throw new Error('拦截器任务不能为空')
    }

    onFulfilled.key = key
    
    return {
      key,
      $once: once,
      fulfilled: onFulfilled,
      rejected: onRejected,
      runWhen
    }
    
  }


  /**
   * 注销拦截器
   * @param key 注册标识或注册函数
   * @example
   * 模式一
   * const task = () => {}
   * interceptor.use(
   *   task
   * )
   * interceptor.eject(task)
   * 
   * 模式二
   * interceptor.use(
   *  'taskId',
   *  task
   * )
   * interceptor.eject(task)
   * or
   * interceptor.eject('taskId')
   */
  eject(key: IndexKey):void
  eject(key: Fulfilled):void
  eject(key: IndexKey | Fulfilled){
    let _k: IndexKey | undefined
    if(is(Function, key)){
        _k = (key as Fulfilled).key
    }else{
      _k = key
    }
    
    _k && this.handlers.$delete(_k)
    
  }

  // 清空拦截器队列
  clean(){
    this.handlers.$clear()
  }

  // 构建任务队列
  queupUp(ctx: InterceptorOptions){

    // 如果拦截器筛选为空, 则应用所有已注册拦截器
    const filter =  ctx.$intercepteFilter ? ctx.$intercepteFilter : (keys: IndexKey[]) => keys
    const keys = [...this.handlers.list]
    
    // 筛选可用队列
    return filter(keys).reduce((acc, next) => {
      const handler = this.handlers.get(next)
      // 移出一次性任务
      // 一次性任务指代一次执行后移除，而非一次queupUp调用后移除， 所以在filter之后调用移除函数
      if(handler?.$once){
        this.eject(handler.key)
      }
      return handler ? [
        ...acc,
        {
          ...handler
        }
      ] : acc
    }, [] as InterceptorHandler<T>[])
   
  }

  // 预设排除筛选
  static excluedByKeys(exclueds: IndexKey[]){
    return (handlersKeys: IndexKey[]) => handlersKeys.filter(key => !exclueds.includes(key)) 
  }

  // 预设包含筛选
  static incluedByKeys(inclueds: IndexKey[]){
    return (handlersKeys: IndexKey[]) => handlersKeys.filter(key => inclueds.includes(key)) 
  }

}