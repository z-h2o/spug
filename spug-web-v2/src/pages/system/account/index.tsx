/**
 * 系统账户管理页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import Form from './Form';
import useSystemAccountStore from '@/stores/systemAccountStore';

const SystemAccount: React.FC = () => {
  const { f_name, formVisible, setFName } = useSystemAccountStore();

  return (
    <AuthDiv auth="system.account.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>账户管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={8} title="账户名称">
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

export default SystemAccount;