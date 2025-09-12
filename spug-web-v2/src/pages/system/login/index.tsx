/**
 * 登录日志页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const SystemLogin: React.FC = () => {
  return (
    <AuthDiv auth="system.login.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>登录日志</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="登录日志"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default SystemLogin;