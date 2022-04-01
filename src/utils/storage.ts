import { getGlobal } from './global'

export type StorageType = 'localStorage' | 'sessionStorage'

const global = getGlobal()

export class LStorage {
  storage: Storage = global.sessionStorage
  type: StorageType = 'sessionStorage'

  constructor(type?: StorageType) {
    this.storage = type === 'localStorage' ? global.localStorage : global.sessionStorage
    if(!this.storage){
      throw new Error(`${this.type}: 不存在`)
    }
  }

  $setItem<T>(key: string, data: T){
    try {
      this.storage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`${this.type} 设置失败: `, error)
    }
  }

  $getItem<T>(key: string): T | undefined{
    try {
      const _d = this.storage.getItem(key)
      return _d ? JSON.parse(_d) : undefined
    } catch (error) {
      console.error(`${this.type} 取值失败: `, error)
    }
  }

  $delete(key: string){
    this.storage.removeItem(key)
  }
  
}

export function buildSetItem(_storage_: typeof localStorage | typeof sessionStorage): <T = any>(_key_: string, _data_: T) => void {
  return <T = any>(_key_: string, _data_: T) => {
    try {
      const dataStr = JSON.stringify(_data_)
      _storage_.setItem(_key_, dataStr)
    } catch (error) {
      console.error(`${typeof (_storage_)} 设置失败: `, error)
    }
  }
}


export function buildGetItem(_storage_: typeof localStorage | typeof sessionStorage): <T = any>(_key_: string) => T | null {
  return <T = any>(_key_: string): T | null => {
    const dataStr = _storage_.getItem(_key_)
    try {
      return dataStr ? JSON.parse(dataStr) : null
    } catch (error) {
      console.error(`${typeof (_storage_)} 获取失败: `, error)
      return null
    }
  }
}