import { 
  AxiosRequestConfig, 
  InterceptorHandler,
  Fulfilled,
  Rejected,
  RunWhen
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
   *   key: 'token',
   *   onFulfilled: setToken,
   *   onRejected: onError
   * })
   */

  use(key: Fulfilled<T>):Interceptor<T>
  use(key: InterceptorItem<T>): Interceptor<T>
  use(key: IndexKey, onFulfilled: Fulfilled<T>): Interceptor<T>
  use(key: Fulfilled<T>, onFulfilled: Rejected): Interceptor<T>
  use(key: IndexKey, onFulfilled: Fulfilled<T>, onRejected: Rejected): Interceptor<T>
  use(key?: IndexKey | Fulfilled<T> | InterceptorItem<T>,  onFulfilled?: Fulfilled, onRejected?: Rejected ){

    let runWhen: RunWhen | undefined
    
    if(!key){
      return this
    }

    if(is(Function, key)){ 
      onRejected = onFulfilled
      onFulfilled = key
      key = new Date().getTime() + this.handlers.list.length
    }
    
    if(is(Object, key)){
      const options = key as InterceptorItem<T>
      key = options.key
      onFulfilled = options.fulfilled
      onRejected = options.rejected
      runWhen = options.runWhen
    }

    if(this.handlers.has(key)){
      throw new Error(`拦截器已注册: ${String(key)}`)
    }

    onFulfilled && this.handlers.$set(key, {
      key,
      fulfilled: onFulfilled,
      rejected: onRejected,
      runWhen
    })

    return this
  }


  // 构建任务队列
  queupUp(ctx: InterceptorOptions){

    // 如果拦截器筛选为空, 则应用所有已注册拦截器
    const filter =  ctx.$intercepteFilter ? ctx.$intercepteFilter : (keys: IndexKey[]) => keys

    // 筛选可用队列
    return filter(this.handlers.list).reduce((acc, next) => {
      const handler = this.handlers.get(next)
      return handler ? [
        ...acc,
        {
          ...handler
        }
      ] : acc
    }, [] as InterceptorHandler<T>[])
   
  }

  static excluedByKeys(exclueds: IndexKey[]){
    return (handlersKeys: IndexKey[]) => handlersKeys.filter(key => !exclueds.includes(key)) 
  }

  static incluedByKeys(inclueds: IndexKey[]){
    return (handlersKeys: IndexKey[]) => handlersKeys.filter(key => inclueds.includes(key)) 
  }

}