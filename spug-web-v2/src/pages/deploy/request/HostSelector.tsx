/**
 * 主机选择器组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Alert, Spin, Space } from 'antd';
import useHostStore from '@/stores/hostStore';
import { get } from 'lodash';

interface HostSelectorProps {
  host_ids: number[];
  app_host_ids: number[];
  onCancel: () => void;
  onOk: (ids: number[]) => void;
}

const HostSelector: React.FC<HostSelectorProps> = ({ 
  host_ids, 
  app_host_ids, 
  onCancel, 
  onOk 
}) => {
  const { fetchRecords, idMap } = useHostStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>(host_ids || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 增加异步逻辑，以修复页面在初次载入时主机列表弹框看不到主机信息的问题
    fetchRecords().then(() => {
      // 异步执行完后，去除 loading 状态
      setIsLoading(false);
    });
  }, [fetchRecords]);

  const handleClickRow = (record: { id: number }) => {
    const index = selectedRowKeys.indexOf(record.id);
    const newSelectedKeys = [...selectedRowKeys];
    
    if (index !== -1) {
      newSelectedKeys.splice(index, 1);
    } else {
      newSelectedKeys.push(record.id);
    }
    
    setSelectedRowKeys(newSelectedKeys);
  };

  const handleSubmit = () => {
    onOk(selectedRowKeys);
  };

  // 若主机列表数据未加载完成，则返回 loading 状态
  if (isLoading) {
    return (
      <Modal
        open
        width={600}
        title="可选主机列表"
        onOk={handleSubmit}
        onCancel={onCancel}
      >
        <Space style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Spin spinning={isLoading} tip="加载中......" size="large" />
        </Space>
      </Modal>
    );
  }

  const dataSource = app_host_ids.map(id => ({ id }));

  return (
    <Modal
      open
      width={600}
      title="可选主机列表"
      onOk={handleSubmit}
      onCancel={onCancel}
    >
      {selectedRowKeys.length > 0 && (
        <Alert
          style={{ marginBottom: 12 }}
          message={`已选择 ${selectedRowKeys.length} 台主机`}
          action={
            <Button type="link" onClick={() => setSelectedRowKeys([])}>
              取消选择
            </Button>
          }
        />
      )}
      
      <Table
        rowKey="id"
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: 480 }}
        onRow={record => ({
          onClick: () => handleClickRow(record)
        })}
        rowSelection={{
          selectedRowKeys,
          onSelect: handleClickRow,
          onSelectAll: (_, __, changeRows) => 
            changeRows.forEach(x => handleClickRow(x))
        }}
      >
        <Table.Column
          title="主机名称"
          dataIndex="id"
          render={(id: number) => get(idMap, `${id}.name`) || `主机-${id}`}
        />
        <Table.Column
          title="连接地址"
          dataIndex="id"
          render={(id: number) => get(idMap, `${id}.hostname`) || '-'}
        />
      </Table>
    </Modal>
  );
};

export default HostSelector;
