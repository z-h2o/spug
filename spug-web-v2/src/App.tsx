/**
 * 应用主组件
 */
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import Login from '@/pages/login';
import SSH from '@/pages/ssh';
import MainLayout from '@/layout';
import '@/styles/global.scss';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

// 配置 message 全局参数
message.config({
  duration: 3,
  maxCount: 3,
});

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}>
            <Spin size="large" />
          </div>
        }>
          <Routes>
            {/* 登录页面 */}
            <Route path="/" element={<Login />} />
            
            {/* SSH 终端页面 */}
            <Route path="/ssh" element={<SSH />} />
            
            {/* 主应用布局 */}
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;