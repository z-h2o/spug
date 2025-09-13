/**
 * 系统角色管理表格组件
 */
import React, { useEffect } from 'react';
import { Modal, Popover, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableCard, AuthButton, Action } from '@/components';
import RoleUsers from './RoleUsers';
import useSystemRoleStore, { SystemRoleRecord } from '@/stores/systemRoleStore';
import useSystemAccountStore from '@/stores/systemAccountStore';
import styles from './index.module.scss';

const SystemRoleTable: React.FC = () => {
  const { 
    isFetching, 
    fetchRecords, 
    showForm,
    showPagePerm,
    showDeployPerm,
    showHostPerm,
    deleteRecord,
    getFilteredRecords
  } = useSystemRoleStore();
  
  const { fetchRecords: fetchAccounts } = useSystemAccountStore();

  useEffect(() => {
    fetchRecords();
    fetchAccounts();
  }, [fetchRecords, fetchAccounts]);

  const handleDelete = (record: SystemRoleRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除角色【${record.name}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      rowKey="id"
      title="角色列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton 
          key="add"
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
      columns={[
        {
          title: '角色名称',
          dataIndex: 'name',
        },
        {
          title: '关联账户',
          render: (record: any) => record.used ? (
            <Popover overlayClassName={styles.roleUser} content={<RoleUsers id={record.id} />}>
              <Button type="link">{record.used}</Button>
            </Popover>
          ) : <Button type="link" disabled>{record.used || 0}</Button>
        },
        {
          title: '描述信息',
          dataIndex: 'desc',
          ellipsis: true
        },
        {
          title: '操作',
          width: 400,
          render: (record: SystemRoleRecord) => (
            <Action>
              <Action.Button onClick={() => showForm(record)}>编辑</Action.Button>
              <Action.Button onClick={() => showPagePerm(record)}>功能权限</Action.Button>
              <Action.Button onClick={() => showDeployPerm(record)}>发布权限</Action.Button>
              <Action.Button onClick={() => showHostPerm(record)}>主机权限</Action.Button>
              <Action.Button danger onClick={() => handleDelete(record)}>删除</Action.Button>
            </Action>
          )
        }
      ]}
    />
  );
};

export default SystemRoleTable;
