/**
 * 欢迎页面
 */
import React from 'react';
import { Breadcrumb, PagePlaceholder } from '@/components';

const WelcomeIndex: React.FC = () => {
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>欢迎</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="欢迎使用 Spug"
        description="现代化的运维管理平台，功能正在完善中..."
      />
    </>
  );
};

export default WelcomeIndex;