/**
 * 配置应用表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import { hasPermission } from '@/utils/functools';
import { useNavigate } from 'react-router-dom';
import useConfigAppStore, { ConfigAppRecord } from '@/stores/configAppStore';

const ConfigAppTable: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isFetching, 
    fetchRecords, 
    showForm, 
    showRel,
    deleteRecord,
    getFilteredRecords
  } = useConfigAppStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = (record: ConfigAppRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const toConfig = (record: ConfigAppRecord) => {
    navigate(`/config/setting/app/${record.id}`);
  };

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="ca"
      rowKey="id"
      title="应用列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="config.app.add"
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
      <Table.Column title="应用名称" dataIndex="name" />
      <Table.Column title="标识符" dataIndex="key" />
      <Table.Column ellipsis title="描述信息" dataIndex="desc" />
      {hasPermission('config.app.edit|config.app.del|config.app.view_config') && (
        <Table.Column 
          width={210} 
          title="操作" 
          render={(record: ConfigAppRecord) => (
            <Action>
              <Action.Button 
                auth="config.app.edit" 
                onClick={() => showForm(record)}
              >
                编辑
              </Action.Button>
              <Action.Button 
                auth="config.app.view_config" 
                onClick={() => showRel(record)}
              >
                依赖
              </Action.Button>
              <Action.Button 
                auth="config.app.view_config" 
                onClick={() => toConfig(record)}
              >
                配置
              </Action.Button>
              <Action.Button 
                danger 
                auth="config.app.del" 
                onClick={() => handleDelete(record)}
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

export default ConfigAppTable;
