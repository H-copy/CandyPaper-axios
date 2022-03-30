/**
 * 断言
 *  - isString() - 字符类型
 *  - isNumber() - 数字类型
 *  - isBoolean() - 布尔类型
 *  - isUndefined() - undefined
 *  - isNull() - null
 *  - isFunction() - 函数类型
 *  - isObject() - 对象类型
 *  - isArray() - 数组类型 
 * 
 *  - isEventName() - 是否为事件名称 例如: 'onClick' 
 * 
 *  - isType() - 是否为某中类型 例如: isType('xx', 'string')
 *  - type() - 获取数据类型 例如: type('xxx') // string
 * 
 * @example
 * ``` ts
 *  isString('xx')
 *  // => true
 * ```
 */

/**
 * 获取对象类型字符
 * @param data 
 * @returns 类型字符
 */
export function type(data: unknown): string {
  const type = Object.prototype.toString.call(data)
  return type.replace(/\[object|\]|\s/igm, '').toLocaleLowerCase()
}

/**
 * 类型校验
 * @param data 
 * @param typeStr
 */
export function isType(data: unknown, typeStr: string): boolean {
  return type(data) === typeStr
}


// 基础类型
export const isString = (data: any): data is string => type(data) === 'string'
export const isNumber = (data: any): data is number => type(data) === 'number'
export const isBoolean = (data: any): data is boolean => type(data) === 'boolean'
export const isUndefined = (data: any): data is undefined => data === undefined
export const isNull = (data: any): data is null => data === null

export const isArray = (data: any): data is any[] => type(data) === 'array'
export const isFunction = <T extends (...args: any[]) => any>(data: any): data is T => type(data) === 'function'
export const isObject = (data: any): data is { [s: string]: any } => type(data) === 'object'

// 特定类型
export const isEventName = (data: any): data is string => (/^on[A-Z]+[a-z]+$/).test(data)
export const isSlotName = (data: any): data is string => (/^v-slot(\:{1}[a-zA-Z]+)?$/).test(data)