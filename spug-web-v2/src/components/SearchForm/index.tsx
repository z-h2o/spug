/**
 * 搜索表单组件
 */
import React from 'react';
import { Card, Row, Col } from 'antd';

interface SearchFormProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

interface SearchFormItemProps {
  title: string;
  span?: number;
  children: React.ReactNode;
}

const SearchForm: React.FC<SearchFormProps> & {
  Item: React.FC<SearchFormItemProps>;
} = ({ children, title, style }) => {
  return (
    <Card 
      size="small" 
      title={title} 
      style={{ marginBottom: 16, ...style }}
      bodyStyle={{ paddingBottom: 8 }}
    >
      <Row gutter={16}>
        {children}
      </Row>
    </Card>
  );
};

const SearchFormItem: React.FC<SearchFormItemProps> = ({ title, span = 8, children }) => {
  return (
    <Col span={span}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ width: 80, textAlign: 'right', marginRight: 8, flexShrink: 0 }}>
          {title}:
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </Col>
  );
};

SearchForm.Item = SearchFormItem;

export default SearchForm;
