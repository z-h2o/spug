/**
 * 模板选择器组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import { includes } from '@/utils/common';

interface TemplateRecord {
  id: number;
  name: string;
  type: string;
  interpreter: string;
  body: string;
  host_ids: number[];
  parameters?: any[];
  desc?: string;
}

interface TemplateSelectorProps {
  onCancel: () => void;
  onOk: (template: TemplateRecord) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onCancel, onOk }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<TemplateRecord[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState<string>();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res: any = await http.get('/api/exec/template/');
      const typeSet = new Set<string>();
      res.forEach((item: TemplateRecord) => {
        typeSet.add(item.type);
      });
      setRecords(res);
      setTypes(Array.from(typeSet));
    } catch (error) {
      message.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (record: TemplateRecord) => {
    onOk(record);
  };

  const filteredRecords = records.filter(record => {
    if (searchName && !includes(record.name, searchName)) {
      return false;
    }
    if (filterType && record.type !== filterType) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模板类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '解释器',
      dataIndex: 'interpreter',
      key: 'interpreter',
      render: (interpreter: string) => (
        <span style={{ 
          color: interpreter === 'python' ? '#1890ff' : '#52c41a' 
        }}>
          {interpreter}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: TemplateRecord) => (
        <a onClick={() => handleSelect(record)}>选择</a>
      ),
    },
  ];

  return (
    <Modal
      title="选择执行模板"
      open={true}
      onCancel={onCancel}
      footer={null}
      width={800}
      styles={{body: { padding: '16px 24px' }}}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="搜索模板名称"
            prefix={<SearchOutlined />}
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择模板类型"
            value={filterType}
            onChange={setFilterType}
            allowClear
            style={{ width: 150 }}
          >
            {types.map(type => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Space>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredRecords}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
          size="small"
        />
      </Space>
    </Modal>
  );
};

export default TemplateSelector;
