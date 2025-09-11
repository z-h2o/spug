/**
 * 页面占位组件
 */
import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({ title, description }) => {
  return (
    <div>
      <Title level={2}>{title}</Title>
      <Card>
        <Empty 
          description={description || `${title}功能开发中...`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    </div>
  );
};

export default PagePlaceholder;
