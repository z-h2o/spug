/**
 * 系统角色管理页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import Form from './Form';
import PagePerm from './PagePerm';
import DeployPerm from './DeployPerm';
import HostPerm from './HostPerm';
import useSystemRoleStore from '@/stores/systemRoleStore';

const SystemRole: React.FC = () => {
  const { 
    f_name, 
    setFName, 
    formVisible, 
    pagePermVisible,
    deployPermVisible,
    hostPermVisible
  } = useSystemRoleStore();

  return (
    <AuthDiv auth="system.role.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>角色管理</Breadcrumb.Item>
      </Breadcrumb>
      <SearchForm>
        <SearchForm.Item span={8} title="角色名称">
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
      {pagePermVisible && <PagePerm />}
      {deployPermVisible && <DeployPerm />}
      {hostPermVisible && <HostPerm />}
    </AuthDiv>
  );
};

export default SystemRole;