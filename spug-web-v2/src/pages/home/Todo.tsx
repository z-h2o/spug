/**
 * 待办事项组件
 */
import React from 'react';
import { Card, List } from 'antd';

const Todo: React.FC = () => {
  return (
    <Card 
      title="待办事项" 
      bodyStyle={{ height: 234, padding: '0 24px' }}
    >
      <List />
    </Card>
  );
};

export default Todo;
