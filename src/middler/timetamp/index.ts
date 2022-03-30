import { AxiosRequestConfig } from 'axios'


function defaultTimetamp(){
  return new Date().getTime()
}

/**
 * url时间戳
 * @param timeProp url参数名称 
 * @param getTimetamp 时间戳获取函数
 * @example
 * 1. 默认
 * candypaper.interceptor.request.use(
 *  'timetamp',
 *   timetamp()
 * )
 * 
 * 2. 自定义参数名
 * candypaper.interceptor.request.use(
 *  'timetamp',
 *  timetamp('time')
 * )
 * 
 * 3. 自定义时间戳生成函数
 * candypaper.interceptor.request.use(
 *  't',
 *  () => new Date().getTime() + '-'
 * )
 */
export function timetamp(timeProp: string = 't', getTimetamp:() => string | number = defaultTimetamp){
  return (ctx: AxiosRequestConfig) => {
    if(!ctx.params){
      ctx.params = {}
    }
    ctx.params[timeProp] = getTimetamp()
    return ctx
  }
}