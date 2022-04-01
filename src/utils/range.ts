
/**
 * 判断值是否在范围内
 * @param min
 * @param max 
 * @returns 
 */
export const range = (min:number, max:number) => (d: number) => {
  const middler = [min, d, max].sort((a, b) => a - b)[1]
  return middler === d
}