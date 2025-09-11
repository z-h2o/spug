/**
 * 便捷导航组件
 */
import React, { useState, useEffect } from 'react';
import { Avatar, Card, Col, Row, Modal } from 'antd';
import { LeftSquareOutlined, RightSquareOutlined, EditOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { AuthButton } from '@/components';
import NavForm from './NavForm';
import http from '@/libs/http';
import styles from './index.module.scss';

interface NavLink {
  name: string;
  url: string;
}

interface NavItem {
  id: number;
  title: string;
  desc: string;
  logo: string;
  links: NavLink[];
}

const Nav: React.FC = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [records, setRecords] = useState<NavItem[]>([]);
  const [record, setRecord] = useState<NavItem | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  function fetchRecords() {
    http.get('/api/home/navigation/')
      .then((res: any) => setRecords(res));
  }

  function handleSubmit() {
    fetchRecords();
    setRecord(null);
  }

  function handleSort(info: NavItem, sort: string) {
    http.patch('/api/home/navigation/', { id: info.id, sort })
      .then(() => fetchRecords());
  }

  function handleDelete(item: NavItem) {
    Modal.confirm({
      title: '操作确认',
      content: `确定要删除【${item.title}】？`,
      onOk: () => http.delete('/api/home/navigation/', { params: { id: item.id } })
        .then(fetchRecords)
    });
  }

  return (
    <>
      <Card
        title="便捷导航"
        className={styles.nav}
        bodyStyle={{ paddingBottom: 0, minHeight: 166 }}
        extra={
          <AuthButton 
            auth="admin" 
            type="link"
            onClick={() => setIsEdit(!isEdit)}
          >
            {isEdit ? '完成' : '编辑'}
          </AuthButton>
        }
      >
        {isEdit ? (
          <Row gutter={24}>
            <Col span={6} style={{ marginBottom: 24 }}>
              <div
                className={styles.add}
                onClick={() => setRecord({ 
                  id: 0, 
                  title: '', 
                  desc: '', 
                  logo: '', 
                  links: [{ name: '', url: '' }] 
                })}
              >
                <PlusOutlined />
                <span>新建</span>
              </div>
            </Col>
            {records.map(item => (
              <Col key={item.id} span={6} style={{ marginBottom: 24 }}>
                <Card 
                  hoverable 
                  actions={[
                    <LeftSquareOutlined key="left" onClick={() => handleSort(item, 'up')} />,
                    <RightSquareOutlined key="right" onClick={() => handleSort(item, 'down')} />,
                    <EditOutlined key="edit" onClick={() => setRecord(item)} />
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar src={item.logo} />}
                    title={item.title}
                    description={item.desc}
                  />
                  <CloseOutlined 
                    className={styles.icon} 
                    onClick={() => handleDelete(item)} 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={24}>
            {records.map(item => (
              <Col key={item.id} span={6} style={{ marginBottom: 24 }}>
                <Card
                  hoverable
                  actions={item.links.map((x, index) => (
                    <a 
                      key={index}
                      href={x.url} 
                      rel="noopener noreferrer" 
                      target="_blank"
                    >
                      {x.name}
                    </a>
                  ))}
                >
                  <Card.Meta
                    avatar={<Avatar size="large" src={item.logo} />}
                    title={item.title}
                    description={item.desc}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
      
      {record && (
        <NavForm 
          record={record} 
          onCancel={() => setRecord(null)} 
          onOk={handleSubmit} 
        />
      )}
    </>
  );
};

export default Nav;
