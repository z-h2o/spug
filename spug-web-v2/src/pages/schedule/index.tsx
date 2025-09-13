/**
 * 任务计划页面
 */
import React, { useEffect } from 'react';
import { Input, Select } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import ScheduleTable from './Table';
import ScheduleForm from './Form';
import ScheduleInfo from './Info';
import ScheduleRecord from './Record';
import useScheduleStore from '@/stores/scheduleStore';

const Schedule: React.FC = () => {
  const {
    f_status,
    f_type,
    f_name,
    types,
    formVisible,
    infoVisible,
    recordVisible,
    fetchRecords,
    setFilterStatus,
    setFilterType,
    setFilterName
  } = useScheduleStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <AuthDiv auth="schedule.schedule.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>任务计划</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={8} title="状态">
          <Select 
            allowClear 
            value={f_status} 
            onChange={setFilterStatus} 
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            <Select.Option value={-1}>待调度</Select.Option>
            <Select.Option value={0}>执行中</Select.Option>
            <Select.Option value={1}>成功</Select.Option>
            <Select.Option value={2}>失败</Select.Option>
          </Select>
        </SearchForm.Item>
        
        <SearchForm.Item span={8} title="类型">
          <Select 
            allowClear 
            value={f_type} 
            onChange={setFilterType} 
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            {types.map(item => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </SearchForm.Item>
        
        <SearchForm.Item span={8} title="名称">
          <Input 
            allowClear 
            value={f_name} 
            onChange={e => setFilterName(e.target.value)} 
            placeholder="请输入" 
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
      </SearchForm>
      
      <ScheduleTable />
      
      {/* 子组件 */}
      {formVisible && <ScheduleForm />}
      {infoVisible && <ScheduleInfo />}
      {recordVisible && <ScheduleRecord />}
    </AuthDiv>
  );
};

export default Schedule;