/**
 * 应用配置页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const ConfigApp: React.FC = () => {
  return (
    <AuthDiv auth="config.app.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item>应用配置</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="应用配置"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default ConfigApp;