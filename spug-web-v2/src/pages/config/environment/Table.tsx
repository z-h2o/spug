/**
 * 环境管理表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal, Divider, message } from 'antd';
import { PlusOutlined, UpSquareOutlined, DownSquareOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import { hasPermission } from '@/utils/auth';
import http from '@/libs/http';
import useConfigEnvStore, { type EnvRecord } from '@/stores/configEnvStore';

const EnvTable: React.FC = () => {
  const { getDataSource, f_name, records, isFetching, fetchRecords, showForm } = useConfigEnvStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 使用响应式计算 dataSource
  const dataSource = React.useMemo(() => {
    return getDataSource();
  }, [records, f_name, getDataSource]);

  const handleDelete = (record: EnvRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: async () => {
        try {
          await http.delete('/api/config/environment/', { params: { id: record.id } });
          message.success('删除成功');
          fetchRecords();
        } catch (error) {
          console.error('Delete failed:', error);
        }
      },
    });
  };

  const handleSort = async (info: EnvRecord, sort: string) => {
    try {
      await http.patch('/api/config/environment/', { id: info.id, sort });
      fetchRecords();
    } catch (error) {
      console.error('Sort failed:', error);
    }
  };

  return (
    <TableCard
      title="环境列表"
      rowKey="id"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="config.env.add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showForm()}
        >
          新建
        </AuthButton>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    >
      <Table.Column 
        width={120} 
        title="排序" 
        key="series" 
        render={(info: EnvRecord) => (
          <div>
            <UpSquareOutlined
              onClick={() => handleSort(info, 'up')}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
            <Divider type="vertical" />
            <DownSquareOutlined
              onClick={() => handleSort(info, 'down')}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </div>
        )} 
      />
      <Table.Column title="环境名称" dataIndex="name" />
      <Table.Column title="标识符" dataIndex="key" />
      <Table.Column ellipsis title="描述信息" dataIndex="desc" />
      {hasPermission('config.env.edit|config.env.del') && (
        <Table.Column 
          title="操作" 
          render={(info: EnvRecord) => (
            <Action>
              <Action.Button 
                auth="config.env.edit" 
                onClick={() => showForm(info)}
              >
                编辑
              </Action.Button>
              <Action.Button 
                danger 
                auth="config.env.del" 
                onClick={() => handleDelete(info)}
              >
                删除
              </Action.Button>
            </Action>
          )} 
        />
      )}
    </TableCard>
  );
};

export default EnvTable;
