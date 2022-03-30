import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { CandyPaper } from '../../core'
// import { token } from './index'

const httpConf = {
  baseURL: 'base',
  timeout: 1000,
}
const http = axios.create(httpConf)
// 包装请求对象
const candyPaper = new CandyPaper(http)


// 自定义MOCK请求适配器
const adapter = <T>(data:T, type: 'resolve'| 'reject' = 'resolve') => {
  return (request: AxiosRequestConfig) => new Promise<AxiosResponse<T>>((resolve, reject) => {
    const res: AxiosResponse<T> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: request,
      data,
    }
    type === 'resolve' ? resolve(res) : reject(res)
  })
}

// 替换真实请求
const reqConf: AxiosRequestConfig = {
  adapter: adapter('ok')
}

describe('middler/timetamp', () => {
  test("add", async () => {
    const d = await candyPaper.get('/', reqConf)
    expect(d.data).toBe('ok')
  })
})

