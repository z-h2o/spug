/**
 * 欢迎页面
 */
import React from 'react';
import { Card } from 'antd';

const WelcomeIndex: React.FC = () => {
  const nickname = localStorage.getItem('nickname') || '用户';
  
  return (
    <Card>
      <div>{nickname}, 欢迎你</div>
    </Card>
  );
};

export default WelcomeIndex;