# token 设置请求头token

## 快速使用
```ts
import { CandyPaper, middler } from './src'

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})

const token = middler.Token.create(
  () => localStorage.setItem('token')
)

http.interceptor.request
.use(
  token.adapter()
)

// or

http.use(token)

```

## 配置

### token获取方式
```ts

http.interceptor.request
  // 固定token
.use(
  middler.Token.create('xxx-xxx-xx').adapter()
)

// 动态token
middler.Token.create((ctx: AxiosRequestConfig) => {
  return sessionstorage.getItem('token')
})
```


### 指定token挂载属性
```ts
// 指定header挂载属性, 默认 token
middler.Token.create('xxx-xxx-xx', 'authentication')
```

### install
Token类实现了CandyPaper注册接口, 方便快速绑定。
```ts

candyPaper.use(
  middler.Token('xxx-xxx-xxx')
)

```



