/**
 * 操作按钮组件
 */
import React from 'react';
import { Space, Button } from 'antd';
import { AuthButton } from '@/components';
import type { ButtonProps } from 'antd';

interface ActionProps {
  children: React.ReactNode;
}

interface ActionButtonProps extends ButtonProps {
  auth?: string;
  children: React.ReactNode;
}

const Action: React.FC<ActionProps> & {
  Button: React.FC<ActionButtonProps>;
} = ({ children }) => {
  return <Space size="small">{children}</Space>;
};

const ActionButton: React.FC<ActionButtonProps> = ({ auth, children, ...props }) => {
  if (auth) {
    return (
      <AuthButton auth={auth} type="link" size="small" {...props}>
        {children}
      </AuthButton>
    );
  }
  
  return (
    <Button type="link" size="small" {...props}>
      {children}
    </Button>
  );
};

Action.Button = ActionButton;

export default Action;
