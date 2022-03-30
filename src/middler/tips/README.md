# tips 消息提示
根据拦截条件，输出提示信息。默认为错误拦截。


## 快速使用
```ts
import { CandyPaper, middler } from './src'

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})
const tips = new middler.Tips()
http.interceptor.response
.use(
  (ctx: AxiosResponse) => {
    return Promise.reject({
      message: 'error'
    })
  }
)
.use(
  tips.onReslove(),
  tips.onReject()
)

http.request({
  url: '/xxx',
  method: 'get'
})

// error

```

## 配置

### 绑定方法
除了手动设置拦截器方法，也提供了绑定类
```ts
// 原axios绑定类
const tips = new middler.TipsForAxios()
tips.withInterceptor(http.candy.interceptor)

// candyPaper 中间件绑定类
const tips = new middler.TipsForCandyPaper()
tips.withInterceptor(http.interceptor)

```

### 自定义输出
默认使用`console.log`输出信息
```ts

const print = (msg: string) => {
  const body =  document.querySelector('body')
  body.innerHTML = msg
}

const tips = new middler.Tips(print)

```

### 自定义错误筛选条件
错误筛选将跳过 `axios.cacnel`，
默认的错误流程：
error.message 
-> error.data.message 
-> error.data 
-> error.status + e.statusText
-> error
 
```ts

const tips = new middler.Tips(print)

// 多条筛选时, 将按顺序执行，知道if函数为true或队列为空
tips.errExcludes:Condition[] = [
  {
    if(e: any) => e?.status === 500,
    act(e: any) => `服务器错误`
  },
  {
    if(e: any) => e?.status === 400,
    act(e: any) => `错误请求`
  }
]


// 跳过某些错误
tips.errExcludes:Condition[] = [
  {
    if(e: any) => e.__CANCLE__,
    act(e: any) => e
  },
]

```