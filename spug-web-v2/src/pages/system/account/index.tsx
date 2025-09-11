/**
 * 系统账户管理页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import AccountTable from './Table';
import AccountForm from './Form';
import useAccountStore from '@/stores/accountStore';

const SystemAccount: React.FC = () => {
  const { f_name, formVisible, setFilterName } = useAccountStore();

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
            onChange={e => setFilterName(e.target.value)} 
            placeholder="请输入" 
          />
        </SearchForm.Item>
      </SearchForm>
      
      <AccountTable />
      
      {formVisible && <AccountForm />}
    </AuthDiv>
  );
};

export default SystemAccount;