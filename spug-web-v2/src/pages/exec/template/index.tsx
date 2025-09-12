/**
 * 模板管理页面
 */
import React from 'react';
import { Input, Select } from 'antd';
import { SearchForm, AuthDiv, Breadcrumb } from '@/components';
import TemplateTable from './Table';
import TemplateForm from './Form';
import useTemplateStore from '@/stores/execTemplateStore';

const ExecTemplate: React.FC = () => {
  const { 
    f_name, 
    f_type, 
    types, 
    formVisible, 
    setFilterName, 
    setFilterType 
  } = useTemplateStore();

  return (
    <AuthDiv auth="exec.template.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>批量执行</Breadcrumb.Item>
        <Breadcrumb.Item>模版管理</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={8} title="模板类型">
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
        <SearchForm.Item span={8} title="模版名称">
          <Input
            allowClear
            value={f_name}
            onChange={e => setFilterName(e.target.value)}
            placeholder="请输入"
            style={{ width: '100%' }}
          />
        </SearchForm.Item>
      </SearchForm>
      
      <TemplateTable />
      
      {formVisible && <TemplateForm />}
    </AuthDiv>
  );
};

export default ExecTemplate;