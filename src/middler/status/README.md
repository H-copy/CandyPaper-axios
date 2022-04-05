# status
请求状态处理

## 快速使用
```ts
import axios from 'axios'
import { CandyPaper, middler } from './src'

const http = new CandyPaper()
const status = middler.StatusForCandyPaper.create()
http.use(
  status
)

status.add(
  // 需要处理的状态码,
  410,
  // 处理函数
  (ctx: middler.StatusCtx) => {
    return Promise.reject({ message: '未登录或登录失效' }) 
  }
)

```

## 配置

### 适配类
```ts
// 适配axios对象
StatusForAxios.install(axios)

// 适配CandyPaper 对象
const http = new CandyPaper()
const status = StatusForCandyPaper.create()
http.use(
  status
)

```

### 状态规则模式
```ts
// 接收需要捕获的状态码,  
status.add(
  410,
  (ctx) => {...}
)

// 接收状态码范围
status.add(
  [200, 300],
  (ctx) => {...}
)

// 自定义状态捕获规则
status.add(
  (ctx: middler.StatusCtx) => {
    if(ctx?.response?.data){
      return ctx.response.data.code === 0
    }
    return false
  },
  (ctx: middler.StatusCtx) => {
    return Promise.reject('请求失败')
  }
)

```

### 移除规则
`remove` 接收`add`状态规则作为移除标识
```ts
const code = 410
status.add(code, () =>)
status.remove(code)
```

### Status API
- add(rule, act) 添加规则
- remove(rule) 移除规则
- clear() 清空规则
- len() 规则条数

- adapterRs(ctx: AxiosResponse) `resolve`端接口
- adapterRj(e: any) `reject`端接口
- run(ctx: StatusCtx) 执行规则


