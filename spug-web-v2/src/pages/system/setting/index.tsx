/**
 * 系统设置页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const SystemSetting: React.FC = () => {
  return (
    <AuthDiv auth="system.setting.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>系统设置</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="系统设置"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default SystemSetting;