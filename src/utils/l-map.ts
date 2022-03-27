
/**
 * map 扩展
 * @props list 键队列
 * @fn $set 设置新值, 并缓存键
 * @fn $delete 删除值, 并移除键
 * @fn $map 遍历键
 */
export class Lmap<K, V> extends Map<K, V>{
  
  // key 添加记录
  list: K[] = []
  
  constructor(entries?: readonly (readonly [K, V])[] | null){
    super(entries)
    entries && entries.map(([key]) => this.list.push(key))
  }

  $set(key: K, value: V): this {
    super.set(key, value)
    this.list.push(key)
    return this
  }
  
  $delete(key: K): boolean {
    if(!this.has(key)){
      return true
    }
    const status = super.delete(key)
    status && this.list.pop()
    return status
  }

  $map<T = any>(cb:(k: K) => T): T[]
  $map<T = any>(cb:(k: K, v?: V) => T):T[] 
  $map<T = any>(cb: (k: K, v?:V) => T): T[]{
    return this.list.map(key => cb(key, this.get(key)))
  }
  
}
