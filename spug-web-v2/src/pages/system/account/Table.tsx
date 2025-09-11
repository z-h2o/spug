/**
 * 账户表格组件
 */
import React, { useState, useEffect } from 'react';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Radio, Modal, Button, Badge, message, Input } from 'antd';
import { TableCard, Action } from '@/components';
import http from '@/libs/http';
import useAccountStore from '@/stores/accountStore';
import useRoleStore from '@/stores/roleStore';

const AccountTable: React.FC = () => {
  const {
    isFetching,
    f_status,
    getDataSource,
    fetchRecords,
    showForm,
    setFilterStatus
  } = useAccountStore();

  const { records: roleRecords, idMap: roleIdMap, fetchRecords: fetchRoleRecords } = useRoleStore();

  const [password, setPassword] = useState('');
  const dataSource = getDataSource();

  useEffect(() => {
    if (roleRecords.length === 0) {
      fetchRoleRecords().then(() => fetchRecords());
    } else {
      fetchRecords();
    }
  }, [roleRecords.length, fetchRoleRecords, fetchRecords]);

  const handleActive = (record: any) => {
    Modal.confirm({
      title: '操作确认',
      content: `确定要${record.is_active ? '禁用' : '启用'}【${record.nickname}】?`,
      onOk: () => {
        return http.patch('/api/account/user/', { 
          id: record.id, 
          is_active: !record.is_active 
        }).then(() => {
          message.success('操作成功');
          fetchRecords();
        });
      },
    });
  };

  const handleReset = (info: any) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: '重置登录密码',
      content: (
        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item required label="重置后的新密码" extra="至少8位包含数字、小写和大写字母。">
            <Input.Password onChange={val => setPassword(val.target.value)} />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        return http.patch('/api/account/user/', { id: info.id, password })
          .then(() => message.success('重置成功', 0.5));
      },
    });
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.nickname}】?`,
      onOk: () => {
        return http.delete('/api/account/user/', { params: { id: record.id } })
          .then(() => {
            message.success('删除成功');
            fetchRecords();
          });
      },
    });
  };

  const columns = [
    {
      title: '登录名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '角色',
      dataIndex: 'role_ids',
      key: 'role_ids',
      render: (roleIds: number[]) => 
        roleIds?.map(x => roleIdMap[x]?.name).filter(Boolean).join(',') || '-',
    },
    {
      title: '状态',
      key: 'status',
      render: (record: any) => 
        record.is_active ? 
          <Badge status="success" text="正常" /> : 
          <Badge status="default" text="禁用" />,
    },
    {
      title: '最近登录',
      dataIndex: 'last_login',
      key: 'last_login',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
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
      ),
    },
  ];

  return (
    <TableCard
      rowKey="id"
      title="账户列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>
          新建
        </Button>,
        <Radio.Group
          key="filter"
          value={f_status}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="true">正常</Radio.Button>
          <Radio.Button value="false">禁用</Radio.Button>
        </Radio.Group>,
      ]}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
    />
  );
};

export default AccountTable;
