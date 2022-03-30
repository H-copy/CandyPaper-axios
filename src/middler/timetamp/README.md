# timetamp
url时间戳

## 快速使用
```ts
import { CandyPaper, middler } from './src'

const http = new CandyPaper({
  baseUrl: 'https://www.baidu.com'
})

http.interceptor.request
.use(
  middler.timetamp()
)

```

## 配置

### 自定义参数名
默认url参数名为 `t`
```ts

middler.timetamp('timetampe')

```

### 自定义时间戳生成器
```ts
import moment from 'moment'


middler.timetamp('t', () => moment().format())

```
