/**
 * 服务管理页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const ConfigService: React.FC = () => {
  return (
    <AuthDiv auth="config.src.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item>服务管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="服务管理"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default ConfigService;