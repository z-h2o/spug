/**
 * 服务配置页面
 */
import React from 'react';
import { Input } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import Table from './Table';
import Form from './Form';
import useConfigServiceStore from '@/stores/configServiceStore';

const ConfigService: React.FC = () => {
  const { f_name, setFName, formVisible } = useConfigServiceStore();

  return (
    <AuthDiv auth="config.src.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item>服务配置</Breadcrumb.Item>
      </Breadcrumb>
      <SearchForm>
        <SearchForm.Item span={8} title="服务名称">
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

export default ConfigService;