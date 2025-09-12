/**
 * 个人信息页面
 */
import React from 'react';
import { Breadcrumb, PagePlaceholder } from '@/components';

const WelcomeInfo: React.FC = () => {
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>个人信息</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="个人信息"
        description="此功能正在开发中，敬请期待..."
      />
    </>
  );
};

export default WelcomeInfo;