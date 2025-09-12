/**
 * 配置服务表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import { hasPermission } from '@/utils/functools';
import { useNavigate } from 'react-router-dom';
import useConfigServiceStore, { ConfigServiceRecord } from '@/stores/configServiceStore';

const ConfigServiceTable: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isFetching, 
    fetchRecords, 
    showForm, 
    deleteRecord,
    getFilteredRecords
  } = useConfigServiceStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = (record: ConfigServiceRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `将会同步删除服务的配置信息，确定要删除服务【${record.name}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const toConfig = (record: ConfigServiceRecord) => {
    navigate(`/config/setting/src/${record.id}`);
  };

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="cs"
      rowKey="id"
      title="服务列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="config.src.add"
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
      <Table.Column title="服务名称" dataIndex="name" />
      <Table.Column title="标识符" dataIndex="key" />
      <Table.Column ellipsis title="描述信息" dataIndex="desc" />
      {hasPermission('config.src.edit|config.src.del|config.src.view_config') && (
        <Table.Column 
          title="操作" 
          render={(record: ConfigServiceRecord) => (
            <Action>
              <Action.Button 
                auth="config.src.edit" 
                onClick={() => showForm(record)}
              >
                编辑
              </Action.Button>
              <Action.Button 
                auth="config.src.view_config" 
                onClick={() => toConfig(record)}
              >
                配置
              </Action.Button>
              <Action.Button 
                danger 
                auth="config.src.del" 
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

export default ConfigServiceTable;
