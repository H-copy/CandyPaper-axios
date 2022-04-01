import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { TimeTamp } from '../index'

describe('middler timetamp', () => {

  let http = new CandyPaper(httpConf)

  beforeEach(() => {
    http = new CandyPaper(httpConf)
  })

  test('默认添加url参数t', async () => {
    const timetamp = TimeTamp.create()
    http.use(timetamp)
    const { config } = await http.get('/', buildReqConf())
    expect(config.params.t).not.toBeUndefined()
  })
  

  test('自定义时间戳生成器', async () => {
    const createTime = jest.fn(() => 'xxx')
    const timetamp = TimeTamp.create(createTime)
    http.use(timetamp)
    const { config } = await http.get('/', buildReqConf())
    expect(config.params.t).toBe('xxx')
    expect(createTime.mock.calls.length).toBe(1)
  })
  

  test('自定义url参数名: timetamp', async () => {
    const timetamp = TimeTamp.create(() => 'xxx', 'timetamp')
    http.use(timetamp)
    const { config } = await http.get('/', buildReqConf())
    expect(config.params.timetamp).not.toBeUndefined()
  })
})