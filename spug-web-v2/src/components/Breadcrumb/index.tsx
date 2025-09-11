/**
 * 面包屑组件
 */
import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';

interface BreadcrumbProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> & {
  Item: typeof AntBreadcrumb.Item;
} = ({ children, style, extra }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <AntBreadcrumb style={style}>
        {children}
      </AntBreadcrumb>
      {extra}
    </div>
  );
};

Breadcrumb.Item = AntBreadcrumb.Item;

export default Breadcrumb;
