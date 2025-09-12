/**
 * 环境管理页面
 */
import React from 'react';
import { Input } from 'antd';
import { Breadcrumb, SearchForm, AuthDiv } from '@/components';
import EnvTable from './Table';
import EnvForm from './Form';
import useConfigEnvStore from '@/stores/configEnvStore';

const ConfigEnvironment: React.FC = () => {
  const { f_name, setFilter, formVisible } = useConfigEnvStore();

  return (
    <AuthDiv auth="config.env.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item>环境管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={8} title="环境名称">
          <Input 
            allowClear 
            value={f_name} 
            onChange={e => setFilter('f_name', e.target.value)} 
            placeholder="请输入"
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
      </SearchForm>
      
      <EnvTable />
      
      {formVisible && <EnvForm />}
    </AuthDiv>
  );
};

export default ConfigEnvironment;