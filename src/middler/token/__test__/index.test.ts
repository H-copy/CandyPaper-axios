import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { Token } from '../index'

describe('middler token', () => {
  
  test('固定token: xxx-xxx', async() => {
    const http = new CandyPaper(httpConf)
    const t = 'xxx-xxx'
    const token = Token.create(t)
    http.interceptor.request.use(token.adapter())
    const { config } = await http.get('/', buildReqConf())
    expect(config.headers).toMatchObject({token: t})
  })

  test('动态token', async () => {
    const http = new CandyPaper(httpConf)
    const t = 'xxx-xxx'
    const getToken = jest.fn(() => t)
    const token = Token.create(getToken)
    http.interceptor.request.use(token.adapter())
    const { config } = await http.get('/', buildReqConf())
    expect(config.headers).toMatchObject({ token: t })
    expect(getToken.mock.calls.length).toBe(1)
  })
  
  test('自定义token绑定属性', async () => {
    const http = new CandyPaper(httpConf)
    const t = 'xxx-xxx'
    const prop = 'auth'
    const token = Token.create(t, prop)
    http.interceptor.request.use(token.adapter())
    const { config } = await http.get('/', buildReqConf())
    expect(config.headers).toMatchObject({ [prop]: t })
  })

  test('install 注册函数', async () => {
    const http = new CandyPaper(httpConf)
    const t = 'xxx-xxx'
    http.use(Token.create(t))
    const { config } = await http.get('/', buildReqConf())
    expect(config.headers).toMatchObject({ token: t })
  })
  
})