import { AxiosRequestConfig } from 'axios'
import { is } from 'ramda'

export const DEF_TOKEN_KEY = 'token'

/**
 * 设置token
 * @param getToken token值或token获取函数
 * @param tokenProp token绑定属性, 默认'token'
 * @example
 * 1. 固定token
 * candyPaper.interceptor.request.use(
 *  'tokenId-xxx-uuu'
 * )
 * 2. 动态token
 * candyPaper.interceptor.response.use(
 *  () => 'tokenId-xxx-uuu'
 * )
 * 3. 修改token挂载属性
 * candyPaper.interceptor.request.use(
 *  'token,Id-xxx-uuu',
 *  'subToken'
 */
export type TokenFiulfilled = (ctx: AxiosRequestConfig) => AxiosRequestConfig
export function token(getToken: string, tokenProp?: string): TokenFiulfilled
export function token(getToken: ((ctx?: AxiosRequestConfig) => string), tokenProp?: string): TokenFiulfilled
export function token(getToken: string | ((ctx?: AxiosRequestConfig) => string), tokenProp = 'token'): TokenFiulfilled {
  const cb = (ctx: AxiosRequestConfig) => {
    if(!ctx.headers){
      ctx.headers = {}
    }
    ctx.headers[tokenProp] = is(String, getToken) ? getToken : getToken(ctx)
    return ctx
  }

  // 默认中间件注册id
  cb.key = DEF_TOKEN_KEY
  return cb
}