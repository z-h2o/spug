/**
 * 系统账户管理表格组件
 */
import React, { useEffect, useState } from 'react';
import { Table, Modal, message, Badge, Radio, Button, Form, Input } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton } from '@/components';
import useSystemAccountStore, { SystemAccountRecord } from '@/stores/systemAccountStore';
import useSystemRoleStore from '@/stores/systemRoleStore';

const SystemAccountTable: React.FC = () => {
  const [password, setPassword] = useState('');
  const { 
    isFetching, 
    fetchRecords, 
    showForm, 
    deleteRecord,
    toggleActive,
    resetPassword,
    getFilteredRecords,
    f_status,
    setFStatus
  } = useSystemAccountStore();
  
  const { 
    fetchRecords: fetchRoles,
    getIdMap: getRoleIdMap
  } = useSystemRoleStore();

  useEffect(() => {
    fetchRoles().then(() => {
      fetchRecords();
    });
  }, [fetchRecords, fetchRoles]);

  const handleActive = (record: SystemAccountRecord) => {
    Modal.confirm({
      title: '操作确认',
      content: `确定要${record.is_active ? '禁用' : '启用'}【${record.nickname}】?`,
      onOk: () => toggleActive(record.id!, !record.is_active),
    });
  };

  const handleReset = (record: SystemAccountRecord) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: '重置登录密码',
      content: (
        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item required label="重置后的新密码" extra="至少8位包含数字、小写和大写字母。">
            <Input.Password onChange={e => setPassword(e.target.value)} />
          </Form.Item>
        </Form>
      ),
      onOk: () => resetPassword(record.id!, password),
    });
  };

  const handleDelete = (record: SystemAccountRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.nickname}】?`,
      onOk: () => deleteRecord(record.id!),
    });
  };

  const roleIdMap = getRoleIdMap();
  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="sa"
      rowKey="id"
      title="账户列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <Button 
          key="add"
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showForm()}
        >
          新建
        </Button>,
        <Radio.Group 
          key="status-filter"
          value={f_status} 
          onChange={e => setFStatus(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="true">正常</Radio.Button>
          <Radio.Button value="false">禁用</Radio.Button>
        </Radio.Group>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    >
      <Table.Column title="登录名" dataIndex="username" />
      <Table.Column title="姓名" dataIndex="nickname" />
      <Table.Column 
        title="角色" 
        dataIndex="role_ids" 
        render={(roleIds: number[]) => 
          roleIds?.map(id => roleIdMap[id]?.name).join(',') || '-'
        }
      />
      <Table.Column 
        title="状态" 
        render={(record: SystemAccountRecord) => 
          record.is_active ? 
            <Badge status="success" text="正常" /> : 
            <Badge status="default" text="禁用" />
        }
      />
      <Table.Column title="最近登录" dataIndex="last_login" />
      <Table.Column 
        title="操作" 
        render={(record: SystemAccountRecord) => (
          <Action>
            <Action.Button onClick={() => handleActive(record)}>
              {record.is_active ? '禁用' : '启用'}
            </Action.Button>
            <Action.Button onClick={() => showForm(record)}>
              编辑
            </Action.Button>
            <Action.Button 
              disabled={record.type === 'ldap'}
              onClick={() => handleReset(record)}
            >
              重置密码
            </Action.Button>
            <Action.Button danger onClick={() => handleDelete(record)}>
              删除
            </Action.Button>
          </Action>
        )} 
      />
    </TableCard>
  );
};

export default SystemAccountTable;