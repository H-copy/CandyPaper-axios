import { AxiosRequestConfig, Fulfilled } from 'axios'
import { CandyPaper } from '../../core'
import { asserts } from '../../utils'

function defaultTimetamp(){
  return `${new Date().getTime()} `
}

export const DEF_TIMETAMP_KEY = 'timetamp'

/**
 * url时间戳
 * @param timeProp url参数名称 
 * @param getTimetamp 时间戳获取函数
 * @example
 * 1. 默认
 * candypaper.interceptor.request.use(
 *  'timetamp',
 *   Timetamp.create()
 * )
 * 
 * 2. 自定义参数名
 * candypaper.interceptor.request.use(
 *  'timetamp',
 *  Timetamp.create('timetamp')
 * )
 * 
 * 3. 自定义时间戳生成函数
 * candypaper.interceptor.request.use(
 *  'timetamp',
 *  Timetamp.create( () => new Date().getTime() + '-', 'time')
 * )
 * 
 */

export class TimeTamp{
  
  static create(getTimetamp?: ((ctx?: AxiosRequestConfig) => string | number) | string, timeProp?: string){
    return new TimeTamp(getTimetamp, timeProp)
  }
  
  timeProp: string
  getTimetamp: (ctx?: AxiosRequestConfig) => string | number

  constructor(getTimetamp: ((ctx?: AxiosRequestConfig) => string | number) | string = defaultTimetamp, timeProp: string = 't' ){
    if (asserts.isString(getTimetamp)){
      timeProp = getTimetamp
      getTimetamp = defaultTimetamp
    }
    this.timeProp = timeProp
    this.getTimetamp = getTimetamp
  }

  install(candyPaper: CandyPaper){
    candyPaper.interceptor.request.use(
      this.adapter()
    )
  }

  adapter(){
    const cb: Fulfilled = (ctx: AxiosRequestConfig) => {

      if(ctx.method !== 'get'){
        return ctx
      }
      
      if (!ctx.params) {
        ctx.params = {}
      }
      ctx.params[this.timeProp] = this.getTimetamp()
      return ctx
    }
    cb.key = DEF_TIMETAMP_KEY

    return cb
  }
  
}
