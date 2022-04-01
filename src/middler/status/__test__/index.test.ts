import { CandyPaper } from '../../../core'
import { buildReqConf, httpConf } from '../../../utils/test-mock'
import { StatusCtx, StatusForCandyPaper } from '../index'


describe('middler status', () => {

  let http = new CandyPaper(httpConf)

  beforeEach(() => {
    http = new CandyPaper(httpConf)
  })

  test('单一状态捕获', async () => {
    const status = StatusForCandyPaper.create()
    http.use(status)
    status.add(
      200,
      (ctx: StatusCtx) => {
        if(ctx.response?.data){
          ctx.response.data = 'xxx'
        }
        return ctx.response
      }
    )
    const d1 = await http.get('/', buildReqConf({data: 'start'}))
    expect(d1.data).toBe('xxx')

    const d2 = await http.get('/', buildReqConf({ data: 'start', status: 302 }))
    expect(d2.data).toBe('start')
    
  })

  test('状态区间捕获', async () => {
    const status = StatusForCandyPaper.create()
    http.use(status)
    status.add(
      [200, 300],
      (ctx: StatusCtx) => {
        if (ctx.response?.data) {
          ctx.response.data = 'xxx'
        }
        return ctx.response
      }
    )
    const d = await http.get('/', buildReqConf({ data: 'start',status: 210 }))
    expect(d.status).toBe(210)
    expect(d.data).toBe('xxx')

    const d2 = await http.get('/', buildReqConf({ data: 'start', status: 100 }))
    expect(d2.data).toBe('start')
  })

  test('状态捕获函数', async () => {
    const status = StatusForCandyPaper.create()
    http.use(status)
    status.add(
      (ctx: StatusCtx) => ctx.data.code === 200, 
      (ctx: StatusCtx) => {
        if (ctx.response?.data) {
          ctx.response.data = 'xxx'
        }
        return ctx.response
      }
    )
    const d = await http.get('/', buildReqConf({ data: {code: 200}, status: 302 }))
    expect(d.status).toBe(302)
    expect(d.data).toBe('xxx')

    const d2 = await http.get('/', buildReqConf({ data: {code: 500}, status: 200 }))
    expect(d2.data.code).toBe(500)
  })  
  
  test('错误状态捕获', async () => {
    const status = StatusForCandyPaper.create()
    http.use(status)
    status.add(
      400,
      () => {
        return Promise.reject(404)
      }
    )
    http.get('/', buildReqConf({ data: 'xxx', status: 400, type: 'reject' }))
    .catch(e => expect(e).toBe(404))
  })

  test('任意错误状态捕获', async () => {
    const status = StatusForCandyPaper.create()
    http.use(status)

    status.add(
      -1,
      () => {
        return Promise.reject(null)
      }
    )
    
    http.get('/', buildReqConf({ data: 'xxx', status: 400, type: 'reject' }))
    .catch(e => expect(e).toBe(null))

    http.get('/', buildReqConf({ data: 'xxx', status: 500, type: 'reject' }))
    .catch(e => expect(e).toBe(null))
    
  })

})