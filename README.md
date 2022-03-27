# CandyPaper 
对 axios 的简单包装例子，提供常用的拦截器工具。


## 🚀 快速使用
```ts
import { CandyPaper, middler } from './src'
import { axios } from 'axios'

const http = new CandyPaper(
  axios.create({
    baseUrl: '/',
    timeout: 1000 * 4
  })
)

http.interceptor.request
// 添加url时间戳
.use(
  middler.timetamp()
)
// 添加token设置
.use(
  middler.token(() => 'xxx-xxx-xxx')
)

// 错误提示
const tips = new middler.TipsForCandyPeper() 
tips.withInterceptor(tips)


// 请求
http.request({
  url: '/',
})
.then(...)
.catch(...)

```


## 🔧 拦截器
Candypaper 自定义了一个自定义的拦截器队列，用于增加一个拦截器管理功能。
例如：请求发起端可选择需要执行的拦截器，原axios需要在拦截器端做控制。

### 基础使用
基础使用与axios相同, 不同的是request拦截器执行顺序与挂载顺序一致，这一点与aixos相反。
```ts
http.interceptor.request
.use(
  (ctx: AxiosRequestConfig) => {
    console.log('req1')
    return ctx
  }
)
// 支持链式调用
.use(
  (ctx: AxiosRequestConfig) => {
    console.log('req2')
    return ctx
  }
)

```

### 自定义挂载标识
如果未配置挂载标识，内部将生成一个随机Id。
```ts

http.interceptor.request
.use(
  // 字符
  'req1',
  (ctx: AxiosRequestConfig) => {
    console.log('req1')
    return ctx
  }
)
.use(
  // 数字
  0,
  (ctx: AxiosRequestConfig) => {
    return ctx
  }
)
.use(
  // symble
  Symble('xxx'),
   (ctx: AxiosRequestConfig) => {
    return ctx
  }
)

```

### 配置对象
```ts

http.interceptor.request(
  {
    key: 'test',
    fulfilled: (ctx: AxiosRequestConfig) => {...}
    rejected: (ctx: AxiosReesponseConfig) => {...}
    // axios 拦截器端筛选方法，只在request端执行
    runWhen: (ctx: AxiosRequestConfig) => {...}
  }
)

```

### 注销
```ts
http.interceptor.request.eject('req1')
```

### 筛选
请求端可配置需要执行的拦截器列表。
```ts
import {
  interceptor
} from './src'

// 过滤指定拦截器
http.get('/', {
  $intercepteFilter: interceptor.Interceptor.excluedByKeys([
    'timetamp'
  ])
})


// 启用指定拦截器
http.get('/', {
  // 排除时间戳拦截器f
  $intercepteFilter: interceptor.Interceptor.incluedByKeys([
    'timetamp'
  ])
})

// 自定义过滤方法
http.get('/', {
  // 排除时间戳拦截器f
  $intercepteFilter: (keys: IndexKey[]) => {
    return keys.includes(key => /^res/igm.test(key))
  }
})


```


## ✨ 中间件
因为自定义拦截器队列的存在，所以一些中间件存在`axios`和 `candypaper` 两种使用方式。

### 列表
- [x] timetamp 时间戳
- [x] token 令牌
- [x] tips 错误提示
- [x] cache 请求缓存
- [x] idempotent 幂等
- [ ] log 日志
- [ ] status 状态码
- [ ] playback 回放


### timetamp 时间戳
防止请求缓存, 未每条url添加自定义时间戳。
```ts
import { middler } from './src'

// 模式使用
http.interceptor.request
.use(
  middler.timetamp()
)

http.request({
  baseUrl: 'https://www.baidu.com'
  url:'/'
})
//  https://www.baidu.com/?t=1648355691457


// 指定时间戳参数名, 
middler.timetamp('timetamp')
// https://www.baidu.com/?timetamp=1648355691457

// 自定义时间戳生成器
middler.timetamp('noCanche', () => {
  return Meth.random().fixed(8)
})

```
### token 令牌设置
设置请求头登录令牌
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

### tips 消息提示
根据请求上下文，判断是否显示提示信息。例如：错误拦截弹窗提示
```ts

// candyPaper 拦截器
const tipsForCandyPaper = new middler.TipsForCandyPaper()
tipsForCandyPaper.withInterceptor(http.interceptor.response)

// axios 拦截器
const tipsForAxios = new middler.TipsForAxios()
tipsForCandyPaper.withInterceptor(http.interceptor.response)

// 指定输入函数， 默认 console.log
const print = (...args: string[]) => {
  const body = document.getElementsByTagName('body')[0]
  body.innerHTML = `
    ${body.innerHTML},
    ${args.join('\n')}
  `
}
const tips = new middler.TipsForCandyPaper(print)

```

### cache 缓存
缓存请求，如果存在匹配请求，返回已缓存值。
```ts

// axios 拦截器
const cache = new middler.CacheForAxios()
cache.withInterceptor(http.candy.interceptors)

// 使用
http.request({
  ...,
  // 开启缓存
  $cache: true
})

http.request({
  ...,
  // 缓存有效期
  $cache: new Date().getTime() + 1000 * 20
})


```


### idempotent 幂等(节流)
多条重复请求时，取消前置请求，只发送最后一条。
```ts

// candyPaper 拦截器
const idempotentForCandyParper = new middler.IdempotentForCandyParper()
idempotentForCandyParper.withInterceptor(http.interceptor)

// axios 拦截器
const idempotentForAxios = new middler.IdempotentForAxios() 
idempotentForAxios.withInterceptor(http.candy.interceptors)


// 自定义判断key
idempotentForCandyParper.creatSaveKey = (ctx: AxiossRequestConfig) => {
  return ctx.url
}


```


