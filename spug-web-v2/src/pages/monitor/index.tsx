/**
 * 监控中心页面
 */
import React from 'react';
import { AuthDiv, Breadcrumb } from '@/components';
import MonitorTable from './Table';
import MonitorForm from './Form';
import MonitorCard from './MonitorCard';
import useMonitorStore from '@/stores/monitorStore';

const Monitor: React.FC = () => {
  const { formVisible } = useMonitorStore();

  return (
    <AuthDiv auth="monitor.monitor.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>监控中心</Breadcrumb.Item>
      </Breadcrumb>
      
      <MonitorCard />
      <MonitorTable />
      
      {formVisible && <MonitorForm />}
    </AuthDiv>
  );
};

export default Monitor;