import axios from 'axios' 
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

import {
  CandyPaper,
  middler,
  interceptor
} from './index'


const print = (...args: any[]) => {
  const body = document.getElementsByTagName('body')[0]
  body.innerHTML = `
    ${body.innerHTML},
    ${args.join('\n')}
  `
}

const tips = new middler.TipsForCandyPaper(print)
const idempotentForAxios = new middler.IdempotentForAxios() 
// const idempotentForCandyParper = new middler.IdempotentForCandyParper() 
// const cache = new middler.CacheForAxios()
const cache = new middler.CacheForCandyPaper()

const core = axios.create({
  baseURL: '/api',
  timeout: 1000 * 3,
})

const http = new CandyPaper(core)


// idempotentForAxios.withInterceptor(http.candy.interceptors)
// idempotentForCandyParper.withInterceptor(http.interceptor)
cache.withInterceptor(http.interceptor)

const timetamp = middler.timetamp()

http.interceptor.request
.use(
  'token',
  middler.token(
    () => 'xxx-xxx-xxx'
  ) 
)
.use(
  'timetamp',
  timetamp
)
.use(
  'req1',
  (v: AxiosRequestConfig) => {
    // console.log('req 1', v)
    return v
  }
)
.use(
  'req2',
  (v: AxiosRequestConfig) => {
    console.log('req 2')
    return v
  }
)

http.interceptor.response
.use(
  'res1',
  (v: AxiosResponse) => {
    console.log('res 1')
    return v
  }
)
.use(
  'res2',
  (v: AxiosResponse) => {
    console.log('res 2')
    // return Promise.reject('xxx')
    return v
  }
)

tips.withInterceptor(http.interceptor)


http.interceptor.request.useOnce(
  'key',
  (ctx: AxiosRequestConfig) => {
    console.log('once')
    return ctx
  }
)

function main(){

   http.request({
    url: '/',
    $cache: true,
    $intercepteFilter: interceptor.Interceptor.excluedByKeys([
      // 'req1',
      // 'req2',
      // 'res1',
      // 'res2',
      // 'tips',
      'timetamp'
    ])
  })
  

  setTimeout(() => {
    http.request({
      url: '/',
      $cache: true,
      $intercepteFilter: interceptor.Interceptor.excluedByKeys([
        // 'req1',
        // 'req2',
        // 'res1',
        // 'res2',
        // 'tips',
        'timetamp'
      ])
    })

  }, 1000)


  
}

main()
