/**
 * 关于组件
 */
import React from 'react';
import styles from './index.module.scss';

const About: React.FC = () => {
  return (
    <div>
      <div className={styles.title}>关于</div>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>关于信息功能正在开发中，敬请期待...</p>
      </div>
    </div>
  );
};

export default About;
