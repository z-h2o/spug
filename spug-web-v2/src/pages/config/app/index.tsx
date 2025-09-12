/**
 * 应用配置页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import Form from './Form';
import Rel from './Rel';
import useConfigAppStore from '@/stores/configAppStore';

const ConfigApp: React.FC = () => {
  const { f_name, setFName, formVisible, relVisible } = useConfigAppStore();

  return (
    <AuthDiv auth="config.app.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item>应用配置</Breadcrumb.Item>
      </Breadcrumb>
      <SearchForm>
        <SearchForm.Item span={8} title="应用名称">
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
      {relVisible && <Rel />}
    </AuthDiv>
  );
};

export default ConfigApp;