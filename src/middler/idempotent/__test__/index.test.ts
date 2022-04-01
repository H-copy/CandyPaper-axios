import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { IdempotentForCandyParper } from '../index'

describe('middler idempotent', () => {

  let http = new CandyPaper(httpConf)

  beforeEach(() => {
    http = new CandyPaper(httpConf)
  })

  test('取消多次请求', () => {
    const i = IdempotentForCandyParper.create()
    http.use(i)
    http.get('/', buildReqConf()).catch(e => expect(e.message).not.toBeUndefined())
    http.get('/', buildReqConf()).then(d => expect(d.data).toBe('ok'))
  })

  test('自定义标记函数', () => {
    const i = IdempotentForCandyParper.create()
    const saveKey = jest.fn(() => 'xxx')
    i.idempotent.creatSaveKey = saveKey
    http.use(i)
    http.get('/', buildReqConf()).catch(e => expect(e.message).toStrictEqual('xxx'))
    http.get('/', buildReqConf()).then(d => expect(d.data).toBe('ok')).finally(() => {
      // 生成key次数
      /**
       * 1. 初始请求 -> 01
       * 2. 二次请求 -> 02
       * 3 取消初始请求，跳过初始请求响应
       * 4. 二次请求完成请求缓存 -> 03
       */
      expect(saveKey.mock.calls.length).toBe(3)
    })
  })
  
})