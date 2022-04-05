# CandyPaper 
对 axios 的简单包装例子，提供常用的拦截器工具。


## 安装
```shell

npm i -S candypaper

```

## 📃 功能列表
- [x] 拦截器扩展
- [x] 常用中间件
<!-- - [ ] 服务，消费端 -->
<!-- - [ ] API装饰器or包装函数 -->


## 🚀 快速使用
```ts
import { CandyPaper, middler } from './src'
import axios from 'axios'

const http = new CandyPaper(
  axios.create({
    baseUrl: '/',
    timeout: 1000 * 4
  })
)

// 错误提示
const tips = new middler.TipsForCandyPeper() 

http
// 添加url时间戳
.use(
  middler.Timetamp.create()
)
// 添加token设置
.use(
  middler.Token.create(() => 'xxx-xxx-xxx')
)
.use(
  tips
)


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

const log = (ctx: AxiosRequestConfig) => {
  console.log(ctx.url)
  return ctx
}
http.interceptor.request.use(
  'log',
  log
) // 注册

// 通过注册标识注销
http.interceptor.request.eject('log')

// 也接收对应的拦截器函数，在注册拦截器时，将为对应的函数设置key标识。
http.interceptor.request.eject(log) // 注销
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

### 一次性拦截器
一次性拦截器，在被加入执行队列后及将被移除。 如果拦截器一直未被调用将一直存在拦截器队列中
```ts

// 方法参数与use一致
http.useOnce(
  'once',
  (ctx: AxiosRequestConfig) => {}
)

```
### 独立拦截器
请求端可以为当前请求配置独立执行的拦截器。
这里的拦截器通过`useOnce`注册到拦截器队列中，所以在被调用后将被注销。也就不会影响其他请求的处理。
```ts

http.get('/', {
  $interceptor: {
    request: [
      {
        key: 'log',
        fulfilled(ctx: AxiosRequestConfig){
          console.log(ctx.url)
          return ctx
        } 
      }
    ],
    response: []
  }
})

```


## ✨ 中间件
因为自定义拦截器队列的存在，所以一些中间件存在`axios`和 `candypaper` 两种使用方式。

- [x] [timetamp 时间戳](./src/middler/timetamp/README.md)
- [x] [token 令牌](./src/middler/token/README.md)
- [x] [tips 错误提示](./src/middler//tips/README.md)
- [x] [cache 请求缓存](./src//middler/cache//README.md)
- [x] [idempotent 幂等](./src/middler/idempotent/README.md)
- [x] [status 状态码](./src//middler/status/README.md)
- [ ] log 日志
<!-- - [ ] playback 回放 -->
