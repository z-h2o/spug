/**
 * 链接按钮组件
 */
import React from 'react';
import { Button } from 'antd';
import { hasPermission } from '@/utils/auth';
import type { ButtonProps } from 'antd';

interface LinkButtonProps extends ButtonProps {
  auth?: string;
  children: React.ReactNode;
}

const LinkButton: React.FC<LinkButtonProps> = ({ auth, children, ...props }) => {
  if (auth && !hasPermission(auth)) {
    return null;
  }
  
  return (
    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} {...props}>
      {children}
    </Button>
  );
};

export default LinkButton;
