import { AxiosResponse } from 'axios'
import { CandyPaper } from '../../core'
import { dataToString, isReqCancel } from '../../utils'

export const DEF_TIPS_KEY = 'tips'

abstract class TipsSource<T = any>{
  abstract onReslove(...args: any[]): (ctx: T) => T
  abstract onReject(...args: any[]): (e: any) => any
}

interface Condition{
  if: (e: any) => boolean
  act: (e: any) => string
}

const defIncludes:Condition[] =  [
  {
    if(e: any){
      return !!e.message
    },
    act(e: any){
      return e.message
    }
  },
  {
    if(e: any){
      return !!e?.data?.message 
    },
    act(e: any){
      return e.data.message
    }
  },
  {
    if(e: any){
      return !!e?.data
    },
    act(e: any){
      return dataToString(e.data)
    }
  },
  {
    if(e: any){
      return !!e.status || !!e.statusText
    },
    act(e: any){
      return `${e.status}|${e.statusText}`
    }
  },
  {
    if(){
      return true
    },
    act(e: any){
      return dataToString(e)
    }
  }
]

const defExcludes:Condition[] = [
  {
    if:isReqCancel,
    act:(e: any) => e
  }
]

export class Tips<T = any> extends TipsSource<T>{

  static create(print?: (msg: string) => void){
    return new Tips(print)
  }
  
  // 自定义输出
  print: (msg: string) => void
  
  // 错误筛选
  errExcludes: Condition[] = defExcludes
  errIncludes: Condition[] = defIncludes
  
  constructor(print?:(msg: string) => void){
    super()
    this.print = print || console.log
  }

  onReslove(){
    return (ctx: T) => ctx
  }

  onReject(){
    return (e: any) => {
      const exclude = this.errExcludes.find(i => i.if(e))
      if(exclude){
        return Promise.reject(exclude.act(e))
      }

      const include = this.errIncludes.find(i => i.if(e))
      if(include){
        this.print(include.act(e))
      }

      return Promise.reject(e)
    }
  }
} 


export class TipsForAxios extends Tips<AxiosResponse> {
  static create(print?: (msg: string) => void): TipsForAxios {
    return new TipsForAxios(print)
  }

  install(candyPaper: CandyPaper){
    candyPaper.interceptor.response.use(
      this.onReslove(),
      this.onReject(),
    )
  }
}

export class TipsForCandyPaper extends Tips<AxiosResponse>{

  static create(print?: (msg: string) => void): TipsForCandyPaper {
    return new TipsForCandyPaper(print)
  }

  tipsKey: IndexKey = DEF_TIPS_KEY
  install(candyPaper: CandyPaper) {
    candyPaper.interceptor.response.use(
      this.tipsKey,
      this.onReslove(),
      this.onReject(),
    )
  }
}
