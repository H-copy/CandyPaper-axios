import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export const httpConf = {
  baseURL: 'base',
  timeout: 1000,
}

interface adapterOptions{
  type?: 'resolve' | 'reject',
  status?: number
}

// 自定义MOCK请求适配器
export const adapter = <T>(data: T, option: adapterOptions = {}) => {
  return (request: AxiosRequestConfig) => new Promise<AxiosResponse<T>>((resolve, reject) => {
    const res: AxiosResponse<T> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: request,
      data,
      ...option
    }
    option === 'reject' ? reject(res) : resolve(res)
  })
}

// 请求配置
export function buildReqConf<T>(conf: AxiosRequestConfig<T> & adapterOptions  = {}){
  const { data, status=200, type='resolve', ...option } = conf
  return {
    adapter: adapter(data || 'ok', {type, status}),
    ...option,
  }
}