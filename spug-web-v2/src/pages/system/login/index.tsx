/**
 * 登录日志页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import useSystemLoginStore from '@/stores/systemLoginStore';

const SystemLogin: React.FC = () => {
  const { f_name, f_ip, setFName, setFIp } = useSystemLoginStore();

  return (
    <AuthDiv auth="system.login.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>登录日志</Breadcrumb.Item>
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
        <SearchForm.Item span={8} title="登录IP">
          <Input 
            allowClear 
            value={f_ip} 
            onChange={e => setFIp(e.target.value)} 
            placeholder="请输入" 
          />
        </SearchForm.Item>
      </SearchForm>
      <Table />
    </AuthDiv>
  );
};

export default SystemLogin;