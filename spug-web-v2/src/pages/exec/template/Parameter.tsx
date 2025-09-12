/**
 * 模板参数设置组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input, Button, Switch, Space, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { uniqueId } from '@/utils/common';

interface ParameterItem {
  id: string;
  key: string;
  name: string;
  required: boolean;
  default: string;
  desc: string;
}

interface ParameterProps {
  parameters: ParameterItem[];
  onCancel: () => void;
  onOk: (parameters: ParameterItem[]) => void;
}

const Parameter: React.FC<ParameterProps> = ({ parameters, onCancel, onOk }) => {
  const [dataSource, setDataSource] = useState<ParameterItem[]>(
    parameters.length > 0 ? parameters : []
  );

  const handleAdd = () => {
    const newParam: ParameterItem = {
      id: uniqueId(),
      key: '',
      name: '',
      required: false,
      default: '',
      desc: '',
    };
    setDataSource([...dataSource, newParam]);
  };

  const handleDelete = (id: string) => {
    setDataSource(dataSource.filter(item => item.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof ParameterItem, value: any) => {
    setDataSource(dataSource.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    // 验证参数
    const validParams = dataSource.filter(item => item.key && item.name);
    onOk(validParams);
  };

  const columns = [
    {
      title: '参数名',
      dataIndex: 'key',
      width: 120,
      render: (value: string, record: ParameterItem) => (
        <Input
          value={value}
          onChange={e => handleFieldChange(record.id, 'key', e.target.value)}
          placeholder="参数名"
          size="small"
        />
      ),
    },
    {
      title: '显示名称',
      dataIndex: 'name',
      width: 120,
      render: (value: string, record: ParameterItem) => (
        <Input
          value={value}
          onChange={e => handleFieldChange(record.id, 'name', e.target.value)}
          placeholder="显示名称"
          size="small"
        />
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      width: 60,
      render: (value: boolean, record: ParameterItem) => (
        <Switch
          checked={value}
          onChange={checked => handleFieldChange(record.id, 'required', checked)}
          size="small"
        />
      ),
    },
    {
      title: '默认值',
      dataIndex: 'default',
      width: 120,
      render: (value: string, record: ParameterItem) => (
        <Input
          value={value}
          onChange={e => handleFieldChange(record.id, 'default', e.target.value)}
          placeholder="默认值"
          size="small"
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render: (value: string, record: ParameterItem) => (
        <Input
          value={value}
          onChange={e => handleFieldChange(record.id, 'desc', e.target.value)}
          placeholder="参数描述"
          size="small"
        />
      ),
    },
    {
      title: '操作',
      width: 60,
      render: (_: any, record: ParameterItem) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="参数设置"
      open={true}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      styles={{body: { padding: '16px 24px' }}}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ width: '100%' }}
        >
          添加参数
        </Button>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          bordered
        />
      </Space>
    </Modal>
  );
};

export default Parameter;
