/**
 * 获取当前环境全局对象
 * @returns
 */
export function getGlobal() {
  return globalThis || self || window || global
}
