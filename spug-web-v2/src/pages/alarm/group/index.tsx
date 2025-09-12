/**
 * 报警组页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const AlarmGroup: React.FC = () => {
  return (
    <AuthDiv auth="alarm.group.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>报警中心</Breadcrumb.Item>
        <Breadcrumb.Item>报警组</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="报警组"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default AlarmGroup;