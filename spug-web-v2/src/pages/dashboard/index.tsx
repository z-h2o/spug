/**
 * Dashboard 页面
 */
import React from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { DatabaseOutlined, UserOutlined, DeploymentUnitOutlined, AlertOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="主机数量"
              value={128}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户数量"
              value={32}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="应用数量"
              value={45}
              prefix={<DeploymentUnitOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="告警数量"
              value={5}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="系统状态" size="small">
            <p>CPU 使用率: 45%</p>
            <p>内存使用率: 68%</p>
            <p>磁盘使用率: 32%</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近活动" size="small">
            <p>用户 admin 登录系统</p>
            <p>应用 web-app 部署成功</p>
            <p>主机 server-01 状态正常</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
