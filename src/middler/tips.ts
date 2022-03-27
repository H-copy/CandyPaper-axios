import { dataToString, isReqCancel } from '../utils'
import { AxiosInterceptor, CandyInterceptor } from '../common'
import { AxiosResponse } from 'axios'

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

  print: (msg: string) => void
  includes: Condition[] = defIncludes
  excludes: Condition[] = defExcludes
  
  constructor(print?:(msg: string) => void){
    super()
    this.print = print || console.log
  }

  onReslove(){
    return (ctx: T) => ctx
  }

  onReject(){
    return (e: any) => {
      const exclude = this.excludes.find(i => i.if(e))
      if(exclude){
        return Promise.reject(exclude.act(e))
      }

      const include = this.includes.find(i => i.if(e))
      if(include){
        this.print(include.act(e))
      }

      return Promise.reject(e)
    }
  }

} 


export class TipsForAxios extends Tips<AxiosResponse> {
  withInterceptor(interceptor: AxiosInterceptor){
    interceptor.response.use(
      this.onReslove(),
      this.onReject(),
    )
  }
}

export class TipsForCandyPaper extends Tips<AxiosResponse>{
   withInterceptor(interceptor: CandyInterceptor, midName='tips'){
    interceptor.response.use(
      midName,
      this.onReslove(),
      this.onReject(),
    )
  }
}
