import { AxiosRequestConfig, Fulfilled } from 'axios'
import { CandyPaper } from '../../core'
import { asserts } from '../../utils'

export const DEF_TOKEN_KEY = 'token'

/**
 * 设置token
 * @param getToken token值或token获取函数
 * @param tokenProp token绑定属性, 默认'token'
 * @example
 * 1.固定token
 * candyPaper.interceptor.request.use(
 *  Token.create('tokenId:xxx-xxx-xxx').adapter()
 * )
 * 2.动态token
 * Token.create(() => 'tokenI:xxx-xxx-uuu').adapter()
 * 
 * 3.修改token挂载属性
 * Token.create(
 *  'tokenId:xxx-xxx-uuu',
 *  'subToken'
 * )
 * 
 * 4.注册, Token对象实现了install函数
 * candyPaper.interceptor.request.use(
 *  Token.create('xxx-xxx-xxx')
 * )
 */
export type TokenFiulfilled = (ctx: AxiosRequestConfig) => AxiosRequestConfig
export class Token {

  static create(getToken: string | ((ctx?: AxiosRequestConfig) => string), tokenProp?: string):Token {
    return new Token(getToken as any, tokenProp)
  }
  
  getToken?: string | ((ctx?: AxiosRequestConfig) => string)
  tokenProp: string = DEF_TOKEN_KEY

  constructor()
  constructor(getToken: string, tokenProp?: string)
  constructor(getToken: ((ctx?: AxiosRequestConfig) => string), tokenProp?: string)
  constructor(getToken?: string | ((ctx?: AxiosRequestConfig) => string), tokenProp = DEF_TOKEN_KEY){
    this.getToken = getToken
    this.tokenProp = tokenProp;
  }
  
  install(candyPaper: CandyPaper){
    candyPaper.interceptor.request.use(
      this.adapter()
    )
  }

  adapter (){
    const cb:Fulfilled = (ctx: AxiosRequestConfig) => {
      if (!ctx.headers) {
        ctx.headers = {}
      }

      if (asserts.isString(this.getToken)) {
        ctx.headers[this.tokenProp] = this.getToken
      }

      if (asserts.isFunction(this.getToken)) {
        ctx.headers[this.tokenProp] = this.getToken(ctx)
      }
      return ctx
    }
    cb.key = this.tokenProp
    return cb
  }
  
}
