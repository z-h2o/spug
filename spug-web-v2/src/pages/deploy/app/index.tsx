/**
 * 应用管理页面
 */
import React, { useEffect } from 'react';
import { Input } from 'antd';
import { Breadcrumb, SearchForm, AuthDiv } from '@/components';
import AppTable from './components/Table';
import AppForm from './components/Form';
import AddSelect from './components/AddSelect';
import Ext1Form from './components/Ext1Form';
import Ext2Form from './components/Ext2Form';
import AutoDeploy from './components/AutoDeploy';
import useDeployAppStore from '@/stores/deployAppStore';
import useConfigEnvStore from '@/stores/configEnvStore';

const DeployApp: React.FC = () => {
  const { 
    fetchRecords, 
    f_name, 
    f_desc, 
    setFilter,
    formVisible,
    addVisible,
    ext1Visible,
    ext2Visible,
    autoVisible
  } = useDeployAppStore();

  const { fetchRecords: fetchEnvRecords, records: envRecords } = useConfigEnvStore();

  useEffect(() => {
    fetchRecords();
    if (envRecords.length === 0) {
      fetchEnvRecords();
    }
  }, [fetchRecords, fetchEnvRecords, envRecords.length]);

  return (
    <AuthDiv auth="deploy.app.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>应用发布</Breadcrumb.Item>
        <Breadcrumb.Item>应用管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={7} title="应用名称">
          <Input 
            allowClear 
            value={f_name} 
            onChange={e => setFilter('f_name', e.target.value)} 
            placeholder="请输入"
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
        <SearchForm.Item span={7} title="描述信息">
          <Input 
            allowClear 
            value={f_desc} 
            onChange={e => setFilter('f_desc', e.target.value)} 
            placeholder="请输入"
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
      </SearchForm>
      
      <AppTable />
      
      {formVisible && <AppForm />}
      {addVisible && <AddSelect />}
      {ext1Visible && <Ext1Form />}
      {ext2Visible && <Ext2Form />}
      {autoVisible && <AutoDeploy />}
    </AuthDiv>
  );
};

export default DeployApp;