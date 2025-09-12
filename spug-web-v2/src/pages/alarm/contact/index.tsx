/**
 * 报警联系人页面
 */
import React from 'react';
import { Breadcrumb, AuthDiv, PagePlaceholder } from '@/components';

const AlarmContact: React.FC = () => {
  return (
    <AuthDiv auth="alarm.contact.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>报警中心</Breadcrumb.Item>
        <Breadcrumb.Item>报警联系人</Breadcrumb.Item>
      </Breadcrumb>
      
      <PagePlaceholder 
        title="报警联系人"
        description="此功能正在开发中，敬请期待..."
      />
    </AuthDiv>
  );
};

export default AlarmContact;