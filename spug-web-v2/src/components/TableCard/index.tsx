/**
 * 表格卡片组件
 */
import React from 'react';
import { Card, Table, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface TableCardProps extends Omit<TableProps<any>, 'title'> {
  title?: React.ReactNode;
  actions?: React.ReactNode[];
  onReload?: () => void;
  tKey?: string;
  children?: React.ReactNode;
}

const TableCard: React.FC<TableCardProps> = ({
  title,
  actions = [],
  onReload,
  tKey,
  children,
  ...tableProps
}) => {
  const cardTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>{title}</div>
      <Space>
        {actions}
        {onReload && (
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onReload}
            title="刷新"
          />
        )}
      </Space>
    </div>
  );

  return (
    <Card title={cardTitle} bodyStyle={{ padding: 0 }}>
      <Table
        size="middle"
        scroll={{ x: 'max-content' }}
        {...tableProps}
      >
        {children}
      </Table>
    </Card>
  );
};

export default TableCard;
