/**
 * 主机表格组件
 */
import React from 'react';
import { Table, Modal, Dropdown, Button, Menu, Avatar, Tooltip, Space, Tag, Radio, Input, message } from 'antd';
import { PlusOutlined, DownOutlined, SyncOutlined, FormOutlined } from '@ant-design/icons';
import { Action, TableCard, AuthButton, AuthFragment } from '@/components';
import IPAddress from './IPAddress';
import { hasPermission } from '@/utils/auth';
import http from '@/libs/http';
import useHostStore from '@/stores/hostStore';
import icons from './icons';
import dayjs from 'dayjs';

const HostTable: React.FC = () => {
  const {
    isFetching,
    f_word,
    f_status,
    group,
    getDataSource,
    fetchRecords,
    showForm,
    showSync,
    showDetail,
    setImportVisible,
    setCloudImport,
    setFilterWord,
    setFilterStatus
  } = useHostStore();

  const dataSource = getDataSource();

  function handleDelete(record: any) {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => {
        return http.delete('/api/host/', { params: { id: record.id } })
          .then(() => {
            message.success('删除成功');
            fetchRecords();
          });
      }
    });
  }

  function handleImport(menu: any) {
    if (menu.key === 'excel') {
      setImportVisible(true);
    } else if (menu.key === 'form') {
      showForm({ group_ids: group.key ? [group.key] : [] });
    } else {
      setCloudImport(menu.key);
    }
  }

  function ExpTime({ value }: { value?: string }) {
    if (!value) return null;
    const expTime = dayjs(value);
    const days = expTime.diff(dayjs(), 'days');
    
    if (days > 30) {
      return <span>剩余 <b style={{ color: '#389e0d' }}>{days}</b> 天</span>;
    } else if (days > 7) {
      return <span>剩余 <b style={{ color: '#faad14' }}>{days}</b> 天</span>;
    } else if (days >= 0) {
      return <span>剩余 <b style={{ color: '#d9363e' }}>{days}</b> 天</span>;
    } else {
      return <span>过期 <b style={{ color: '#d9363e' }}>{Math.abs(days)}</b> 天</span>;
    }
  }

  const columns = [
    {
      title: '主机名称',
      dataIndex: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Action.Button onClick={() => showDetail(record)}>{text}</Action.Button>
      )
    },
    {
      title: 'IP地址',
      render: (record: any) => (
        <div>
          <IPAddress ip={record.public_ip_address} isPublic />
          <IPAddress ip={record.private_ip_address} />
        </div>
      )
    },
    {
      title: '配置信息',
      render: (record: any) => (
        <Space>
          <Tooltip title={record.os_name}>
            <Avatar shape="square" size={16} src={icons[record.os_type as keyof typeof icons] || icons.linux} />
          </Tooltip>
          <span>{record.cpu}核 {record.memory}GB</span>
        </Space>
      )
    },
    {
      title: '到期信息',
      dataIndex: 'expired_time',
      render: (value: string) => <ExpTime value={value} />
    },
    {
      title: '备注信息',
      dataIndex: 'desc'
    },
    {
      title: '状态',
      dataIndex: 'is_verified',
      render: (value: boolean) => 
        value ? <Tag color="green">已验证</Tag> : <Tag color="orange">未验证</Tag>
    }
  ];

  if (hasPermission('host.host.edit|host.host.del|host.host.console')) {
    columns.push({
      title: '操作',
      width: 160,
      render: (record: any) => (
        <Action>
          <Action.Button auth="host.host.edit" onClick={() => showForm(record)}>
            编辑
          </Action.Button>
          <Action.Button danger auth="host.host.del" onClick={() => handleDelete(record)}>
            删除
          </Action.Button>
        </Action>
      )
    } as any);
  }

  return (
    <TableCard
      rowKey="id"
      title={
        <Input
          allowClear
          value={f_word}
          placeholder="输入名称/IP检索"
          style={{ maxWidth: 250 }}
          onChange={e => setFilterWord(e.target.value)}
        />
      }
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthFragment key="add" auth="host.host.add">
          <Dropdown
            overlay={
              <Menu onClick={handleImport}>
                <Menu.Item key="form">
                  <Space>
                    <FormOutlined style={{ fontSize: 16, marginRight: 4, color: '#1890ff' }} />
                    <span>新建主机</span>
                  </Space>
                </Menu.Item>
                <Menu.Item key="excel">
                  <Space>
                    <Avatar shape="square" size={20} src={icons.excel} />
                    <span>Excel</span>
                  </Space>
                </Menu.Item>
                <Menu.Item key="ali">
                  <Space>
                    <Avatar shape="square" size={20} src={icons.alibaba} />
                    <span>阿里云</span>
                  </Space>
                </Menu.Item>
                <Menu.Item key="tencent">
                  <Space>
                    <Avatar shape="square" size={20} src={icons.tencent} />
                    <span>腾讯云</span>
                  </Space>
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="primary" icon={<PlusOutlined />}>
              新建 <DownOutlined />
            </Button>
          </Dropdown>
        </AuthFragment>,
        <AuthButton
          key="sync"
          auth="host.host.add"
          type="primary"
          icon={<SyncOutlined />}
          onClick={showSync}
        >
          验证
        </AuthButton>,
        <Radio.Group
          key="filter"
          value={f_status}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value={false}>未验证</Radio.Button>
        </Radio.Group>
      ]}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        hideOnSinglePage: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    />
  );
};

export default HostTable;
