/**
 * 权限控制按钮组件
 */
import React from 'react';
import { Button, type ButtonProps } from 'antd';
import { hasPermission } from '@/utils/auth';

interface AuthButtonProps extends ButtonProps {
  auth?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ auth, disabled, ...props }) => {
  // 检查权限，如果没有权限则禁用或隐藏按钮
  const hasAuth = hasPermission(auth);
  
  if (!hasAuth) {
    return null; // 没有权限时隐藏按钮
  }
  
  return <Button disabled={disabled} {...props} />;
};

export default AuthButton;
