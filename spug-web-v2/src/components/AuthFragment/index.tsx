/**
 * 权限控制片段组件
 */
import React from 'react';
import { hasPermission } from '@/utils/auth';

interface AuthFragmentProps {
  auth?: string;
  children: React.ReactNode;
}

const AuthFragment: React.FC<AuthFragmentProps> = ({ auth, children }) => {
  // 检查权限
  if (auth && !hasPermission(auth)) {
    return null;
  }
  
  return <>{children}</>;
};

export default AuthFragment;
