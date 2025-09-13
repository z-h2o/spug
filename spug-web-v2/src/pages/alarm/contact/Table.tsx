/**
 * 报警联系人表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import { hasPermission } from '@/utils/auth';
import useAlarmContactStore, { AlarmContactRecord } from '@/stores/alarmContactStore';

const AlarmContactTable: React.FC = () => {
  const { 
    isFetching, 
    fetchRecords, 
    showForm, 
    deleteRecord,
    getFilteredRecords
  } = useAlarmContactStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = (record: AlarmContactRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="ac"
      rowKey="id"
      title="报警联系人"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="alarm.contact.add"
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
      <Table.Column title="姓名" dataIndex="name" />
      <Table.Column title="手机号" dataIndex="phone" />
      <Table.Column ellipsis title="邮箱" dataIndex="email" />
      <Table.Column ellipsis title="钉钉" dataIndex="ding" />
      <Table.Column ellipsis title="微信" dataIndex="wx_token" />
      <Table.Column ellipsis title="企业微信" dataIndex="qy_wx" />
      {hasPermission('alarm.contact.edit|alarm.contact.del') && (
        <Table.Column 
          title="操作" 
          render={(record: AlarmContactRecord) => (
            <Action>
              <Action.Button 
                auth="alarm.contact.edit" 
                onClick={() => showForm(record)}
              >
                编辑
              </Action.Button>
              <Action.Button 
                danger 
                auth="alarm.contact.del" 
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

export default AlarmContactTable;
