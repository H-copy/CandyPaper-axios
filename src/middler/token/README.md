# token 设置请求头token

## 快速使用
```ts
import { CandyPaper, middler } from './src'

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})

http.interceptor.request
.use(
  middler.token(
    () => localStorage.setItem('token')
  )
)

```

## 配置

```ts

http.interceptor.request
  // 固定token
.use(
  middler.token('xxx-xxx-xx')
)

// 动态token
middler.token((ctx: AxiosRequestConfig) => {
  return sessionstorage.getItem('token')
})

// 指定header挂载属性, 默认 token
middler.token('xxx-xxx-xx', 'authentication')

```
