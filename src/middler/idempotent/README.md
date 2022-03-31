# idempotent
幂等请求，多次相同请求，将取消前置请求。

## 快速使用
```ts
import axios from 'axios'
import { CandyPaper, middler } from './src'

Idempotent.withCancelToken(axios.cancelToken)
// 挂载取消生成器
const idempotent = new middler.Idempotent(axios.CancelToken)

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})

http.interceptor.request
.use(
  ctx => idempotent.adapterIn(ctx)
)

http.interceptor.response
.use(
  ctx => idempotent.adapterOut(ctx)
)


```

## 配置


### 快速绑定
```ts

// axios 拦截器绑定
const idempotent = new middler.IdempotentForAxios(axios.CancelToken)
idempotent.install(http.candy)

// candyPaper 中间件
const idempotent = new middler.withInterceptor(axios.CancelToken)
http.use(idempotent)


```

### 自定义缓存标识函数
中间通过上下文对象构建，缓存及判断标识。 如果前后请求生成的标识相同，取消前次请求。
```ts

const idempotent = new middler.Idempotent(axios.CancelToken)

idempotent.creatSaveKey = (ctx: AxiosRequestConfig) => {
  return ctx.url
}

```

### 标识列表
```ts
const idempotent = new middler.Idempotent(axios.CancelToken)
// 标识顺序既添加顺序
const keys = idempotent._map.list

```

## tips
1. 如果请求配置了`cancelToken`, 将调换中间件处理逻辑（中间件将失效，需要用户自己控制何时取消请求）