/**
 * 侧边栏组件
 */
import React, { useState, useEffect } from 'react';
import { Layout, Menu, type MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasPermission } from '@/utils/auth';
import routes from '@/routes';
import { RouteConfig } from '@/types/route';
import styles from './index.module.scss';

interface SiderProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const { Sider: AntSider } = Layout;

const Sider: React.FC<SiderProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 构建菜单项
  const buildMenuItems = (routes: RouteConfig[]): MenuItem[] => {
    return routes
      .filter(route => {
        // 过滤掉没有权限的路由和特殊路由
        if (route.path?.startsWith('/welcome')) return false;
        return !route.auth || hasPermission(route.auth);
      })
      .map(route => {
        if (route.child) {
          // 有子菜单的情况
          const children = buildMenuItems(route.child);
          if (children.length === 0) return null;
          
          return {
            key: route.path || route.title,
            icon: route.icon,
            label: route.title,
            children
          };
        } else if (route.path) {
          // 普通菜单项
          return {
            key: route.path,
            icon: route.icon,
            label: route.title,
            onClick: () => navigate(route.path!)
          };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];
  };

  const menuItems = buildMenuItems(routes);

  // 根据当前路径设置选中和展开的菜单
  useEffect(() => {
    const path = location.pathname;
    setSelectedKeys([path]);

    // 设置展开的菜单
    const openKeys: string[] = [];
    routes.forEach(route => {
      if (route.child) {
        const hasActiveChild = route.child.some(child => 
          child.path && path.startsWith(child.path.split('/:')[0])
        );
        if (hasActiveChild) {
          openKeys.push(route.path || route.title || '');
        }
      }
    });
    setOpenKeys(openKeys);
  }, [location.pathname]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <AntSider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={200}
      className={styles.sider}
    >
      <div className={styles.logo}>
        <img 
          src="/logo.svg" 
          alt="Spug" 
          className={styles.logoImg}
        />
        {!collapsed && <span className={styles.logoText}>Spug</span>}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        className={styles.menu}
      />
    </AntSider>
  );
};

export default Sider;
