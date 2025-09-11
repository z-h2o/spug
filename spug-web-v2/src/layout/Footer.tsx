/**
 * 底部组件
 */
import React from 'react';
import { Layout } from 'antd';
import styles from './index.module.scss';

const { Footer: AntFooter } = Layout;

interface FooterProps {
  collapsed?: boolean;
}

const Footer: React.FC<FooterProps> = ({ collapsed = false }) => {
  return (
    <AntFooter className={`${styles.footer} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.footerContent}>
        <span>© 2025 Spug 运维管理平台</span>
        <span>基于 React 18 + Vite + Ant Design 构建</span>
      </div>
    </AntFooter>
  );
};

export default Footer;
