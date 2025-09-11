/**
 * 主机管理页面
 */
import React from 'react';
import { Card, Typography, Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { AuthButton } from '@/components';

const { Title } = Typography;

const Host: React.FC = () => {
  const columns = [
    { title: '主机名', dataIndex: 'name', key: 'name' },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', render: () => (
      <>
        <Button type="link">编辑</Button>
        <Button type="link" danger>删除</Button>
      </>
    )}
  ];

  const data = [
    { key: 1, name: 'server-01', ip: '192.168.1.10', status: '在线' },
    { key: 2, name: 'server-02', ip: '192.168.1.11', status: '在线' },
    { key: 3, name: 'server-03', ip: '192.168.1.12', status: '离线' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>主机管理</Title>
        <AuthButton auth="host.host.add" type="primary" icon={<PlusOutlined />}>
          新建主机
        </AuthButton>
      </div>
      
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default Host;
