/**
 * 权限管理工具
 */

interface Permission {
  isReady: boolean;
  isSuper: boolean;
  permissions: string[];
}

let permission: Permission = {
  isReady: false,
  isSuper: false,
  permissions: []
};

export let X_TOKEN: string | null = null;

// 检测移动设备
export const isMobile = /Android|iPhone/i.test(navigator.userAgent);

/**
 * 更新权限信息
 */
export function updatePermissions() {
  X_TOKEN = localStorage.getItem('token');
  permission.isReady = true;
  permission.isSuper = localStorage.getItem('is_supper') === 'true';
  try {
    permission.permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  } catch (e) {
    permission.permissions = [];
  }
}

/**
 * 检查权限
 * @param strCode 权限码，支持 | (OR) 和 & (AND) 逻辑
 */
export function hasPermission(strCode?: string): boolean {
  const { isSuper, permissions } = permission;
  
  // 无权限码或超级管理员直接通过
  if (!strCode || isSuper) return true;
  
  // 支持OR逻辑 (|分隔) 和AND逻辑 (&分隔)
  for (const orItem of strCode.split('|')) {
    if (isSubArray(permissions, orItem.split('&'))) {
      return true;
    }
  }
  return false;
}

/**
 * 检查数组包含关系
 */
function isSubArray(parent: string[], child: string[]): boolean {
  for (const item of child) {
    if (!parent.includes(item.trim())) {
      return false;
    }
  }
  return true;
}

/**
 * 获取当前权限信息
 */
export function getPermission() {
  return permission;
}

/**
 * 清除权限信息
 */
export function clearPermissions() {
  X_TOKEN = null;
  permission = {
    isReady: false,
    isSuper: false,
    permissions: []
  };
  localStorage.removeItem('token');
  localStorage.removeItem('is_supper');
  localStorage.removeItem('permissions');
}
