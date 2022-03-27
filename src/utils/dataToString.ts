export function dataToString<T = any>(d: T):string{
  try {
    return JSON.stringify(d)
  } catch (error) {
    console.warn(`数据格式化失败: `, error)
    return ''
  }
}