/**
 * SSH 终端页面
 */
import React from 'react';
import { PagePlaceholder } from '@/components';

const SSH: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PagePlaceholder 
        title="SSH 终端"
        description="此功能正在开发中，敬请期待..."
      />
    </div>
  );
};

export default SSH;