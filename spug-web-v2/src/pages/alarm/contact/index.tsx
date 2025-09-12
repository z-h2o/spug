/**
 * 报警联系人页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import Form from './Form';
import useAlarmContactStore from '@/stores/alarmContactStore';

const AlarmContact: React.FC = () => {
  const { f_name, setFName, formVisible } = useAlarmContactStore();

  return (
    <AuthDiv auth="alarm.contact.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>报警中心</Breadcrumb.Item>
        <Breadcrumb.Item>报警联系人</Breadcrumb.Item>
      </Breadcrumb>
      <SearchForm>
        <SearchForm.Item span={8} title="姓名">
          <Input 
            allowClear 
            value={f_name} 
            onChange={e => setFName(e.target.value)} 
            placeholder="请输入" 
          />
        </SearchForm.Item>
      </SearchForm>
      <Table />
      {formVisible && <Form />}
    </AuthDiv>
  );
};

export default AlarmContact;