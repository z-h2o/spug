/**
 * 工作台页面
 */
import React from 'react';
import { Row, Col } from 'antd';
import { Breadcrumb } from '@/components';
import Notice from './Notice';
import Todo from './Todo';
import Nav from './Nav';

const Home: React.FC = () => {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={12}>
        <Col span={16}>
          <Todo />
        </Col>
        <Col span={8}>
          <Notice />
        </Col>
      </Row>
      <Nav />
    </div>
  );
};

export default Home;
