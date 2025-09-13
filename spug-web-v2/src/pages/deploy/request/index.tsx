/**
 * 发布申请主页面
 */
import React, { useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { SearchForm, Breadcrumb, Action } from '@/components';
import { includes } from '@/utils/common';
import { hasPermission } from '@/utils/auth';
import useRequestStore from '@/stores/requestStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import useConfigAppStore from '@/stores/configAppStore';
import RequestTable from './Table';
import Ext1Form from './Ext1Form';
import Ext2Form from './Ext2Form';
import AppSelector from '@/pages/deploy/app/components/AppSelector';
import Approve from './Approve';
import Rollback from './Rollback';
import BatchDelete from './BatchDelete';
import Ext1Console from './Ext1Console';
import Ext2Console from './Ext2Console';
import styles from './index.module.scss';

const RequestIndex: React.FC = () => {
  const {
    fetchRecords,
    leaveConsole,
    f_env_id,
    f_app_id,
    f_s_date,
    f_e_date,
    addVisible,
    ext1Visible,
    ext2Visible,
    batchVisible,
    approveVisible,
    rollbackVisible,
    tabs,
    setEnvId,
    setAppId,
    setAddVisible,
    setBatchVisible,
    updateDate,
    confirmAdd
  } = useRequestStore();

  const { records: envRecords, fetchRecords: fetchEnvRecords } = useConfigEnvStore();
  const { records: appRecords, fetchRecords: fetchAppRecords } = useConfigAppStore();

  useEffect(() => {
    fetchRecords();
    if (envRecords.length === 0) {
      fetchEnvRecords();
    }
    if (appRecords.length === 0) {
      fetchAppRecords();
    }
    
    return () => {
      leaveConsole();
    };
  }, [fetchRecords, fetchEnvRecords, fetchAppRecords, envRecords.length, appRecords.length, leaveConsole]);

  if (!hasPermission('deploy.request.view')) {
    return null;
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>应用发布</Breadcrumb.Item>
        <Breadcrumb.Item>发布申请</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={6} title="发布环境">
          <Select
            allowClear
            showSearch
            value={f_env_id}
            filterOption={(input, option) => 
              includes(String(option?.children || ''), input)
            }
            onChange={setEnvId}
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            {envRecords.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </SearchForm.Item>
        
        <SearchForm.Item span={6} title="应用名称">
          <Select
            allowClear
            showSearch
            value={f_app_id}
            filterOption={(input, option) => 
              includes(String(option?.children || ''), input)
            }
            onChange={setAppId}
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            {appRecords.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </SearchForm.Item>
        
        <SearchForm.Item span={8} title="申请时间">
          <DatePicker.RangePicker
            value={f_s_date ? [
              dayjs(f_s_date), 
              dayjs(f_e_date || f_s_date)
            ] : undefined}
            onChange={updateDate}
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
        
        <SearchForm.Item span={2} title="">
          {hasPermission('deploy.request.del') && (
            <Action.Button
              auth="deploy.request.del"
              type="primary"
              danger
              size='middle'
              icon={<DeleteOutlined />}
              onClick={() => setBatchVisible(true)}
            >
              批量删除
            </Action.Button>
          )}
        </SearchForm.Item>
      </SearchForm>
      
      <RequestTable />
      
      <AppSelector
        visible={addVisible}
        onCancel={() => setAddVisible(false)}
        onSelect={confirmAdd}
      />
      
      {/* 表单组件 */}
      {ext1Visible && <Ext1Form />}
      {ext2Visible && <Ext2Form />}
      
      <BatchDelete />
      <Approve />
      <Rollback />
      
      {/* 控制台组件 */}
      {tabs.length > 0 && (
        <div className={styles.miniConsole}>
          {tabs.map(item => 
            item.id ? (
              item.app_extend === '1' ? (
                <Ext1Console key={item.id} request={item} />
              ) : (
                <Ext2Console key={item.id} request={item} />
              )
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default RequestIndex;