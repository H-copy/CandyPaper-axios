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

### 状态规则模式

1. 单一状态
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