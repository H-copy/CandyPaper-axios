import type { AxiosResponse, AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { CandyPaper } from '../../core'
import { asserts, range } from '../../utils'

export const DEF_STATUS_KEY = 'status'

export const enum CUM_CODE {
  // 未知捕获
  UNKNOWN = -1,
  // 请求失败,未获取到 status
  UNKNOWN_RES = -2
}

export interface StatusCtx<T = any> {
  config: AxiosRequestConfig;
  data?: T
  status: number
  response?: AxiosResponse
  request?: any
}

export type StatusCode = number 
export type StatusCodeRange = [number, number]

export interface StatusValidate<T = any> {
  (ctx: StatusCtx<T>): boolean
} 

export interface StatusValidator{
  (ctx: StatusCtx): boolean
}
export interface StatusAct<T = any>{
  (ctx: StatusCtx): T | Promise<T>
}

export type RulesIndex = StatusCode | StatusCodeRange | StatusValidate

function isAxiosError(e: any): e is AxiosError{
  return e.isAxiosError !== undefined && e.isAxiosError
}

function isNumberCode(code: any): code is StatusCode{
  return asserts.isNumber(code)
}

function isRangeCode(code: any): code is StatusCodeRange{
  return asserts.isArray(code) && code.length === 2
}

function isFnCode(code: any): code is StatusValidate{
  return asserts.isFunction(code)
}

export interface StatusRule<T>{
  if: StatusValidator
  act: StatusAct<T>
}

export class Status<T>{
  rules: Map<RulesIndex, StatusRule<T>> = new Map()

  add(key:RulesIndex, act:StatusAct<T>){

    /**
     * 单一状态
     * add(404)
     */
    if (isNumberCode(key)){
      this.rules.set(
        key,
        {
          if: (ctx: StatusCtx) => ctx.status === key,
          act,
        }
      )
      return this
    }

    /**
     * 范围状态
     * add([200, 300])
     */
    if(isRangeCode(key)){
      this.rules.set(
        key,
        {
          if: (ctx: StatusCtx) => range(key[0], key[1])(ctx.status),
          act,
        }
      )
      return this
    }

    /**
     * 自定义判断函数
     * add((ctx: StatusCtx) => ctx.data.code === 200)
     */
    if (isFnCode(key)){
      this.rules.set(
        key,
        {
          if: key,
          act
        }
      )
      
      return this
    }
    throw new Error(`状态规则必须为 Number, [Number, Number], (ctx: StatusCtx) => boolean`) 
  }
  
  remove(key:RulesIndex){
    if(this.rules.has(key)){
      this.rules.delete(key)
    }
    return this
  }

  clear(){
    this.rules = new Map()
  }

  len(){
    return [...this.rules.keys()].length
  }

  run(ctx: StatusCtx){
    for (let i of this.rules.values()) {
      if (i.if(ctx)) {
        return i.act(ctx)
      }
    }
  }

  /**
   * 成功接收器 
   * @param ctx
   */
  adapterRs(ctx: AxiosResponse){
    const statusCtx: StatusCtx = {
      data: ctx.data,
      status: ctx.status,
      config: ctx.config,
      request: ctx.request,
      response: ctx
    }
    const d = this.run(statusCtx)
    return d || ctx
  }

  /**
   * 错误接收器
   * @param e 
   */
  adapterRj(e: any){
    
    let statusCtx = {
      config: {},
      status: CUM_CODE.UNKNOWN
    } as StatusCtx
    
    if (isAxiosError(e)){
      const { response, request } = e
      statusCtx = {
        config: e.config,
        status: response?.status || CUM_CODE.UNKNOWN_RES,
        request: request,
        response: response,
        data: response?.data
      }
    }

    const d = this.run(statusCtx)
    return d || Promise.reject(e)    
  }
}


export class StatusForAxios<T> extends Status<T>{
  static create() {
    return new StatusForAxios()
  }

  install(axios: AxiosInstance) {
    return axios.interceptors.response.use(
      (ctx: AxiosResponse) => this.adapterRs(ctx),
      (e: any) => this.adapterRj(e)
    )
  }
}

export class StatusForCandyPaper<T> extends Status<T>{
  installKey: string = DEF_STATUS_KEY

  static create(){
    return new StatusForCandyPaper()
  }
  
  install(candyPaper: CandyPaper) {
    return candyPaper.interceptor.response.use(
      this.installKey,
      (ctx: AxiosResponse) => this.adapterRs(ctx) as any,
      (e: any) => this.adapterRj(e)
    )
  }
}
