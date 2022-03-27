
// 是否为请求取消错误
export function isReqCancel(e: any){
  return e?.__CANCEL__
}