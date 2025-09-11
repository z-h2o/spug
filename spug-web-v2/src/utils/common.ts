/**
 * 通用工具函数
 */

/**
 * 组合类名
 */
export function clsNames(...args: (string | undefined | null | false)[]): string {
  return args.filter(x => x).join(' ');
}

/**
 * 字符串包含判断
 */
function isInclude(s: string, keys: string | string[]): boolean {
  if (!s) return false;
  if (Array.isArray(keys)) {
    for (const k of keys) {
      if (s.toLowerCase().includes(k.toLowerCase())) return true;
    }
    return false;
  } else {
    return s.toLowerCase().includes(keys.toLowerCase());
  }
}

/**
 * 字符串/数组包含判断
 */
export function includes(s: string | string[], keys: string | string[]): boolean {
  if (Array.isArray(s)) {
    for (const i of s) {
      if (isInclude(i, keys)) return true;
    }
    return false;
  } else {
    return isInclude(s, keys);
  }
}

/**
 * 清理命令中的\r符号
 */
export function cleanCommand(text: string): string {
  return text ? text.replace(/\r\n/g, '\n') : '';
}

/**
 * 数组包含关系判断
 */
export function isSubArray(parent: string[], child: string[]): boolean {
  for (const item of child) {
    if (!parent.includes(item.trim())) {
      return false;
    }
  }
  return true;
}

/**
 * 替换toFixed方法，去除多余的0和小数点
 */
export function trimFixed(data: number, bit: number): string {
  return String(data.toFixed(bit)).replace(/0*$/, '').replace(/\.$/, '');
}

/**
 * 格式化日期
 */
export function humanDate(date?: Date): string {
  const now = date || new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

/**
 * 格式化时间
 */
export function humanTime(date?: Date): string {
  const now = date || new Date();
  const hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
  const minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  const second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  return `${hour}:${minute}:${second}`;
}

/**
 * 格式化日期时间
 */
export function humanDateTime(date?: Date): string {
  return `${humanDate(date)} ${humanTime(date)}`;
}

/**
 * 生成唯一ID
 */
export function uniqueId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as { [key: string]: any };
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as { [key: string]: any })[key]);
    });
    return cloned as T;
  }
  return obj;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}
