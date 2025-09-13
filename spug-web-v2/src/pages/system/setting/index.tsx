/**
 * 系统设置页面
 */
import React, { useState } from 'react';
import { Menu } from 'antd';
import { AuthDiv, Breadcrumb } from '@/components';
import AlarmSetting from './AlarmSetting';
import LDAPSetting from './LDAPSetting';
import OpenService from './OpenService';
import KeySetting from './KeySetting';
import SecuritySetting from './SecuritySetting';
import PushSetting from './PushSetting';
import About from './About';
import styles from './index.module.scss';

const SystemSetting: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState(['security']);

  const handleMenuSelect = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys);
  };

  return (
    <AuthDiv auth="system.setting.view">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item>系统设置</Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles.container}>
        <div className={styles.left}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            style={{ border: 'none' }}
            onSelect={handleMenuSelect}
          >
            <Menu.Item key="security">安全设置</Menu.Item>
            <Menu.Item key="ldap">LDAP设置</Menu.Item>
            <Menu.Item key="key">密钥设置</Menu.Item>
            <Menu.Item key="push">推送服务设置</Menu.Item>
            <Menu.Item key="alarm">报警服务设置</Menu.Item>
            <Menu.Item key="service">开放服务设置</Menu.Item>
            <Menu.Item key="about">关于</Menu.Item>
          </Menu>
        </div>
        <div className={styles.right}>
          {selectedKeys[0] === 'security' && <SecuritySetting />}
          {selectedKeys[0] === 'ldap' && <LDAPSetting />}
          {selectedKeys[0] === 'alarm' && <AlarmSetting />}
          {selectedKeys[0] === 'push' && <PushSetting />}
          {selectedKeys[0] === 'service' && <OpenService />}
          {selectedKeys[0] === 'key' && <KeySetting />}
          {selectedKeys[0] === 'about' && <About />}
        </div>
      </div>
    </AuthDiv>
  );
};

export default SystemSetting;