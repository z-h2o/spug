/**
 * 工具函数
 */

/**
 * 检查字符串是否包含搜索词（不区分大小写）
 */
export function includes(str: string, searchStr: string): boolean {
  if (!str || !searchStr) return false;
  return str.toLowerCase().includes(searchStr.toLowerCase());
}

/**
 * 深度克隆对象
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => cloneDeep(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = cloneDeep(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
