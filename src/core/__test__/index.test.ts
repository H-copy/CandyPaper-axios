import axios from 'axios'
import { CandyPaper } from '../index'
import { buildReqConf, httpConf } from '../../utils/test-mock'

describe('CandyPaper', () => {

  test('未绑定axios, 抛出错误', () => {
    const http = new CandyPaper(httpConf)
    expect(() => http.get('/', buildReqConf())).toThrow(Error)
  })

  test('静态方法withAxios绑定axios', () => {
    CandyPaper.withAxios(axios)
    const http1 = new CandyPaper(httpConf)
    const http2 = new CandyPaper(httpConf)
    expect(http1.candy).not.toBeUndefined()
    expect(http2.candy).not.toBeUndefined()
    expect(() => http1.get('/', buildReqConf())).not.toThrow(Error)
    expect(() => http2.get('/', buildReqConf())).not.toThrow(Error)    
  })
  
})