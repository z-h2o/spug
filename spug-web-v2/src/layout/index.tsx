/**
 * 主布局组件
 */
import React, { useState, useEffect, Suspense } from 'react';
import { Layout, message, Spin } from 'antd';
import { Routes, Route } from 'react-router-dom';
import { hasPermission, isMobile } from '@/utils/auth';
import { NotFound } from '@/components';
import { useGlobalStore } from '@/stores/globalStore';
import routes from '@/routes';
import { RouteConfig } from '@/types/route';
import Sider from './Sider';
import Header from './Header';
// import Footer from './Footer';
import styles from './index.module.scss';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { fetchUserSettings } = useGlobalStore();

  useEffect(() => {
    // 移动端默认收起侧边栏
    if (isMobile) {
      setCollapsed(true);
      message.warning('检测到您在移动设备上访问，请使用横屏模式。');
    }
    
    // 获取用户设置
    fetchUserSettings();
  }, [fetchUserSettings]);

  // 构建路由组件
  const buildRoutes = (routes: RouteConfig[]): React.ReactElement[] => {
    const routeElements: React.ReactElement[] = [];
    
    routes.forEach(route => {
      if (route.component) {
        // 检查权限
        if (!route.auth || hasPermission(route.auth)) {
          routeElements.push(
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          );
        }
      }
      
      // 递归处理子路由
      if (route.child) {
        routeElements.push(...buildRoutes(route.child));
      }
    });
    
    return routeElements;
  };

  const routeElements = buildRoutes(routes);

  return (
    <Layout className={styles.layout}>
      <Sider collapsed={collapsed} />
      <Layout>
        <Header 
          collapsed={collapsed} 
          toggle={() => setCollapsed(!collapsed)} 
        />
        <Layout.Content className={`${styles.content} ${collapsed ? styles.collapsed : ''}`}>
          <div className={`${styles.contentInner}`}>
            <Suspense fallback={<Spin size="large" className={styles.loading} />}>
              <Routes>
                {routeElements}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Layout.Content>
        {/* <Footer collapsed={collapsed} /> */}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
