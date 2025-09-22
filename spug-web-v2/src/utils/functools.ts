export const isMobile = /Android|iPhone/i.test(navigator.userAgent);

export function clsNames(...args: (string | undefined | null | false)[]): string {
  return args.filter(x => x).join(' ');
}

function isInclude(s: string, keys: string | string[]): boolean {
  if (!s) return false;
  if (Array.isArray(keys)) {
    for (let k of keys) {
      k = k.toLowerCase();
      if (s.toLowerCase().includes(k)) return true;
    }
    return false;
  } else {
    const k = keys.toLowerCase();
    return s.toLowerCase().includes(k);
  }
}

// 字符串包含判断
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

// 清理输入的命令中包含的\r符号
export function cleanCommand(text?: string): string {
  return text ? text.replace(/\r\n/g, '\n') : '';
}

//  数组包含关系判断
export function isSubArray(parent: string[], child: string[]): boolean {
  for (const item of child) {
    if (!parent.includes(item.trim())) {
      return false;
    }
  }
  return true;
}

// 用于替换toFixed方法，去除toFixed方法多余的0和小数点
export function trimFixed(data: number, bit: number): string {
  return String(data.toFixed(bit)).replace(/0*$/, '').replace(/\.$/, '');
}

// 日期
export function human_date(date?: Date): string {
  const now = date || new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

// 时间
export function human_time(date?: Date): string {
  const now = date || new Date();
  const hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
  const minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  const second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  return `${hour}:${minute}:${second}`;
}

export function human_datetime(date?: Date): string {
  return `${human_date(date)} ${human_time(date)}`;
}

// 生成唯一id
export function uniqueId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
