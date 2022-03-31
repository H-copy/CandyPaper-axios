import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export const httpConf = {
  baseURL: 'base',
  timeout: 1000,
}

// 自定义MOCK请求适配器
export const adapter = <T>(data: T, type: 'resolve' | 'reject' = 'resolve') => {
  return (request: AxiosRequestConfig) => new Promise<AxiosResponse<T>>((resolve, reject) => {
    const res: AxiosResponse<T> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: request,
      data
    }
    type === 'resolve' ? resolve(res) : reject(res)
  })
}

// 请求配置
export function buildReqConf<T>(conf: AxiosRequestConfig<T>  = {}){
  const { data, ...option } = conf
  return {
    adapter: adapter(data || 'ok'),
    ...option,
  }
}