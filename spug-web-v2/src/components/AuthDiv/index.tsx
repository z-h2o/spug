/**
 * 权限控制容器组件
 */
import React from 'react';
import { hasPermission } from '@/utils/auth';

interface AuthDivProps {
  auth?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AuthDiv: React.FC<AuthDivProps> = ({ 
  auth, 
  disabled = false, 
  children, 
  className,
  style,
  ...props 
}) => {
  // 如果设置了权限码但没有权限，或者被禁用，则不渲染
  if ((auth && !hasPermission(auth)) || disabled) {
    return null;
  }
  
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

export default AuthDiv;
