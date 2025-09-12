/**
 * 报警组表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import { hasPermission } from '@/utils/functools';
import useAlarmGroupStore, { AlarmGroupRecord } from '@/stores/alarmGroupStore';

const AlarmGroupTable: React.FC = () => {
  const { 
    isFetching, 
    fetchRecords, 
    showForm, 
    deleteRecord,
    getFilteredRecords
  } = useAlarmGroupStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = (record: AlarmGroupRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="ag"
      rowKey="id"
      title="报警联系组"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="alarm.group.add"
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
      <Table.Column title="组名称" dataIndex="name" />
      <Table.Column 
        ellipsis 
        title="成员" 
        dataIndex="contacts" 
        render={(value: number[]) => `${value?.length || 0}个`}
      />
      <Table.Column ellipsis title="描述信息" dataIndex="desc" />
      {hasPermission('alarm.group.edit|alarm.group.del') && (
        <Table.Column 
          title="操作" 
          render={(record: AlarmGroupRecord) => (
            <Action>
              <Action.Button 
                auth="alarm.group.edit" 
                onClick={() => showForm(record)}
              >
                编辑
              </Action.Button>
              <Action.Button 
                danger 
                auth="alarm.group.del" 
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

export default AlarmGroupTable;
