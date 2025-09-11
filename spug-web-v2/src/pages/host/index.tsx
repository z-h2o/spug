/**
 * 主机管理页面
 */
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { AuthDiv, Breadcrumb, AuthButton } from '@/components';
import Group from './Group';
import HostTable from './Table';
import HostDetail from './Detail';
import HostForm from './Form';
import Import from './Import';
import CloudImport from './CloudImport';
import BatchSync from './BatchSync';
import useHostStore from '@/stores/hostStore';

const Host: React.FC = () => {
  const { initial } = useHostStore();

  useEffect(() => {
    initial();
  }, [initial]);

  function openTerminal() {
    window.open('/ssh');
  }

  return (
    <AuthDiv auth="host.host.view">
      <Breadcrumb
        extra={
          <AuthButton
            auth="host.console.view|host.console.list"
            type="primary"
            icon={<CodeOutlined />}
            onClick={openTerminal}
          >
            Web 终端
          </AuthButton>
        }
      >
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>主机管理</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={12}>
        <Col span={6}>
          <Group />
        </Col>
        <Col span={18}>
          <HostTable />
        </Col>
      </Row>

      {/* 子组件 */}
      <HostDetail />
      <HostForm />
      <Import />
      <CloudImport />
      <BatchSync />
    </AuthDiv>
  );
};

export default Host;
