/**
 * 角色管理页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const SystemRole: React.FC = () => {
  return (
    <AuthDiv auth="system.role.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>角色管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="角色管理"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default SystemRole;