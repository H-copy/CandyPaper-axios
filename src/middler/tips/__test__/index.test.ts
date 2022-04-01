import type { AxiosResponse } from 'axios'
import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { TipsForCandyPaper } from '../index'

describe('middler tips', () => {

  let http = new CandyPaper(httpConf)
  beforeEach(() => {
    http = new CandyPaper(httpConf)
  })

  test('自定义错误输出', async () => {
    const print = jest.fn((msg: string) => {console.log(msg)});
    const tips = TipsForCandyPaper.create(print)
    http.interceptor.response.use(
      (ctx: AxiosResponse) => {
        return Promise.reject({message: 'error'})
      }
    )
    http.use(tips)

    try {
      await http.get('/', buildReqConf())
    } catch (error: any) {
      expect(error.message).toBe('error')
      expect(print).toHaveBeenCalledWith('error')
    }
  })
  
})