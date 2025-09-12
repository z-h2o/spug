/**
 * 发布申请页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const DeployRequest: React.FC = () => {
  return (
    <AuthDiv auth="deploy.request.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>应用发布</Breadcrumb.Item>
        <Breadcrumb.Item>发布申请</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="发布申请"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default DeployRequest;