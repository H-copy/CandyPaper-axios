import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { CacheByStorage, CacheForCandyPaper } from '../index'


describe('middler cache', () => {
  let http = new CandyPaper(httpConf)

  beforeEach(() => {
    http = new CandyPaper(httpConf)
  })

  test('Map缓存', async () => {
    const cache = CacheForCandyPaper.create() 
    http.use(cache)
    const data = 'from req 1'
    const d1 = await http.get('/', buildReqConf({data, $cache: true}))
    const d2 = await http.get('/', buildReqConf({$cache: true}))
    
    // 初始请求正常返回 
    expect(d1.data).toBe(data)
    // 再次请求返回缓存
    expect(d2.data).toBe(data)
  })

  // sessionStorage 测试依赖 jest-localstorage-mock
  test('sessionStorage 缓存', async() => {
    const lStorage = new CacheByStorage() 
    const cache = CacheForCandyPaper.create(lStorage)
    http.use(cache)
    const data = 'from req 1'
    const d1 = await http.get('/', buildReqConf({ data, $cache: true }))
    const d2 = await http.get('/', buildReqConf({ $cache: true }))

    expect(d1.data).toBe(data)
    expect(d2.data).toBe(data)
  })

  test('localStorage 缓存', async () => {
    const sStorage = new CacheByStorage('localStorage')
    const cache = CacheForCandyPaper.create(sStorage)
    http.use(cache)
    const data = 'from req 1'
    const d1 = await http.get('/', buildReqConf({ data, $cache: true }))
    const d2 = await http.get('/', buildReqConf({ $cache: true }))

    expect(d1.data).toBe(data)
    expect(d2.data).toBe(data)
  })

})