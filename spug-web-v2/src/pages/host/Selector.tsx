/**
 * 主机选择器组件
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Table, Input, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useHostStore from '@/stores/hostStore';
import { includes } from '@/utils/common';

interface HostSelectorProps {
  value?: number[];
  onChange?: (ids: number[] | any[]) => void;
  type?: 'button' | 'rows';
  mode?: 'rows' | 'default';
  onlyOne?: boolean;
  children?: React.ReactNode;
}

const HostSelector: React.FC<HostSelectorProps> = ({
  value = [],
  onChange,
  type = 'button',
  mode = 'default',
  onlyOne = false,
  children
}) => {
  const { fetchRecords, rawRecords } = useHostStore();
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>(value);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible && rawRecords.length === 0) {
      fetchRecords();
    }
  }, [visible, rawRecords.length, fetchRecords]);

  // useEffect(() => {
  //   setSelectedRowKeys(value);
  // }, [value]);

  const handleOk = () => {
    if (mode === 'rows') {
      onChange?.(selectedRows);
    } else {
      onChange?.(selectedRowKeys);
    }
    setVisible(false);
  };

  const handleCancel = () => {
    setSelectedRowKeys(value);
    setSelectedRows([]);
    setVisible(false);
  };

  const handleSelectChange = (keys: React.Key[], rows: any[]) => {
    if (onlyOne && keys.length > 1) {
      message.warning('只能选择一个主机');
      return;
    }
    setSelectedRowKeys(keys as number[]);
    setSelectedRows(rows);
    
    if (onlyOne && keys.length === 1) {
      if (mode === 'rows') {
        onChange?.(rows[0]);
      } else {
        onChange?.(keys as number[]);
      }
      setVisible(false);
    }
  };

  // 直接使用 rawRecords，避免 getRecords() 带来的引用变化问题
  const filteredRecords = useMemo(() => 
    rawRecords.filter(record => 
      !searchText || 
      includes(record.name, searchText) ||
      includes(record.hostname || '', searchText)
    ), [rawRecords, searchText]
  );

  const columns = [
    {
      title: '主机名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '连接地址',
      dataIndex: 'hostname',
      key: 'hostname',
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '备注',
      dataIndex: 'desc',
      key: 'desc',
    },
  ];

  const rowSelection = {
    type: onlyOne ? 'radio' : 'checkbox',
    selectedRowKeys,
    onChange: handleSelectChange,
  };

  const getSelectedText = () => {
    if (selectedRowKeys.length === 0) {
      return '请选择';
    }
    return `已选择 ${selectedRowKeys.length} 台主机`;
  };

  return (
    <>
      {type === 'button' ? (
        <Button onClick={() => setVisible(true)}>
          {getSelectedText()}
        </Button>
      ) : (
        <span onClick={() => setVisible(true)} style={{ cursor: 'pointer' }}>
          {children}
        </span>
      )}
      
      <Modal
        title="选择主机"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="搜索主机名称或地址"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredRecords}
            rowSelection={rowSelection as any}
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
    </>
  );
};

export default HostSelector;
