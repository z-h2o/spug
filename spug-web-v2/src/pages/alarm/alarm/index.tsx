/**
 * 报警管理页面
 */
import React from 'react';
import { SyncOutlined } from '@ant-design/icons';
import { Input, Button } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import useAlarmStore from '@/stores/alarmStore';

const AlarmAlarm: React.FC = () => {
  const { f_name, setFName, fetchRecords } = useAlarmStore();

  return (
    <AuthDiv auth="alarm.alarm.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>报警中心</Breadcrumb.Item>
        <Breadcrumb.Item>报警历史</Breadcrumb.Item>
      </Breadcrumb>
      <SearchForm>
        <SearchForm.Item span={8} title="任务名称">
          <Input 
            allowClear 
            value={f_name} 
            onChange={e => setFName(e.target.value)} 
            placeholder="请输入" 
          />
        </SearchForm.Item>
        <SearchForm.Item span={8} title="">
          <Button type="primary" icon={<SyncOutlined />} onClick={fetchRecords}>
            刷新
          </Button>
        </SearchForm.Item>
      </SearchForm>
      <Table />
    </AuthDiv>
  );
};

export default AlarmAlarm;