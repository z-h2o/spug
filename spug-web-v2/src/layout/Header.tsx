/**
 * 顶部导航组件
 */
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, type MenuProps, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clearPermissions } from '@/utils/auth';
import styles from './index.module.scss';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  toggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearPermissions();
    message.success('已退出登录');
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/welcome/info')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/system/setting')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <AntHeader className={`${styles.header} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          className={styles.trigger}
        />
      </div>
      
      <div className={styles.headerRight}>
        <Space size="middle">
          <Button
            type="text"
            icon={<BellOutlined />}
            className={styles.actionBtn}
          />
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div className={styles.userInfo}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span className={styles.username}>管理员</span>
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
