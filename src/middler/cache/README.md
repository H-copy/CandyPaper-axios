# cache
缓存请求结果,发起相同请求时, 返回缓存。


## 快速使用
```ts
import axios from 'axios'
import { CandyPaper, middler } from './src'

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})

// 缓存仓库
const mapStore = new middler.CacheByMap()
const cache = new middler.Cache(mapStore)

http.interceptor.request.use(
  cache.adapterIn()
)

http.interceptor.response.use(
  cache.adapterOut()
)

```

## 配置

### 快速绑定
```ts

const mapStore = new middler.CacheByMap()

// axios 拦截器模式
const cache = new middler.CacheForAxios(mapStore)
cache.withInterceptor(cache)

// candyPaper 中间件模式
const cache = new middler.CacheForCandyPaper(mapStore)
cache.withInterceptor()

```

### 存储介质
`Cache` 可以接收不同的存储介质，使用时可以根据具体的情况选择适合的存储方式 
```ts
// Map 缓存
const mapStore = new middler.CacheByMap()

// sessionStorage
const sessionStorageStore = new middler.CacheByStorage()
// or
const sessionStorageStore = new middler.CacheByStorage('sessionStorage')

// localStorage
const localStorageStore = new middler.CacheByStorage('localStorage')

```

### 修改缓存标识生成函数
```ts

const cache = new middler.Cache(mapStore)
cache.creatSaveKey = (ctx: AxiosRequestConfig) => {
  return ctx.url
}

```