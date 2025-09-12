/**
 * 报警记录页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const AlarmAlarm: React.FC = () => {
  return (
    <AuthDiv auth="alarm.alarm.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>报警中心</Breadcrumb.Item>
        <Breadcrumb.Item>报警记录</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="报警记录"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default AlarmAlarm;