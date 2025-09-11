/**
 * SSH 终端页面
 */
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const SSH: React.FC = () => {
  return (
    <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card>
        <Title level={2}>SSH 终端</Title>
        <p>SSH 终端功能开发中...</p>
      </Card>
    </div>
  );
};

export default SSH;
