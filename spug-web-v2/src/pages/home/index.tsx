/**
 * 工作台首页
 */
import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <div>
      <Title level={2}>工作台</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={4}>欢迎使用 Spug 运维管理平台</Title>
            <p>这是基于 React 18 + Vite + Ant Design 重构的新版本</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
