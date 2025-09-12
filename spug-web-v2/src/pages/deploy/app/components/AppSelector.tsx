/**
 * 应用选择器组件
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Menu, Spin, Input } from 'antd';
import { OrderedListOutlined, BuildOutlined, SearchOutlined } from '@ant-design/icons';
import useConfigEnvStore from '@/stores/configEnvStore';
import { includes } from '@/utils/common';
import http from '@/libs/http';
import styles from './AppSelector.module.scss';

interface AppSelectorProps {
  visible: boolean;
  filter?: (item: any) => boolean;
  onCancel: () => void;
  onSelect: (deploy: any) => void;
}

const AppSelector: React.FC<AppSelectorProps> = ({ 
  visible, 
  filter, 
  onCancel, 
  onSelect 
}) => {
  const { records: envRecords, idMap: envIdMap, fetchRecords: fetchEnvRecords, isFetching: envFetching } = useConfigEnvStore();
  
  const [fetching, setFetching] = useState(false);
  const [envId, setEnvId] = useState<number>();
  const [search, setSearch] = useState('');
  const [deploys, setDeploys] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      setFetching(true);
      http.get('/api/app/deploy/')
        .then((res: any) => setDeploys(res))
        .finally(() => setFetching(false));
        
      if (!envRecords.length) {
        fetchEnvRecords().then(initEnv);
      } else {
        initEnv();
      }
    }
  }, [visible, envRecords.length, fetchEnvRecords]);

  const initEnv = () => {
    if (envRecords.length) {
      setEnvId(envRecords[0].id);
    }
  };

  let records = deploys.filter(x => x.env_id === Number(envId));
  if (search) {
    records = records.filter(x => 
      includes(x.app_name, search) || includes(x.app_key, search)
    );
  }
  if (filter) {
    records = records.filter(filter);
  }

  const menuItems = envRecords.map(x => ({
    key: String(x.id),
    label: x.name,
    title: x.name
  }));

  return (
    <Modal
      open={visible}
      width={800}
      maskClosable={false}
      title="选择应用"
      onCancel={onCancel}
      footer={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.appSelector}>
        <div className={styles.left}>
          <Spin spinning={envFetching}>
            <Menu
              mode="inline"
              selectedKeys={envId ? [String(envId)] : []}
              style={{ border: 'none' }}
              items={menuItems}
              onSelect={({ selectedKeys }) => setEnvId(Number(selectedKeys[0]))}
            />
          </Spin>
        </div>

        <div className={styles.right}>
          <Spin spinning={fetching}>
            <div className={styles.title}>
              <div className={styles.text}>
                {envIdMap[envId!]?.name || ''}
              </div>
              <Input
                allowClear
                style={{ width: 200 }}
                placeholder="请输入快速检索应用"
                prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ height: 540, overflow: 'auto' }}>
              {records.map(item => (
                <div 
                  key={item.id} 
                  className={styles.appItem} 
                  onClick={() => onSelect(item)}
                >
                  {item.extend === '1' ? <OrderedListOutlined /> : <BuildOutlined />}
                  <div className={styles.body}>{item.app_name}</div>
                  <div className={styles.key}>{item.app_key}</div>
                </div>
              ))}
              {records.length === 0 && (
                <div className={styles.tips}>
                  该环境下还没有可发布或构建的应用哦，快去
                  <Link to="/deploy/app">应用管理</Link>
                  创建应用发布配置吧。
                </div>
              )}
            </div>
          </Spin>
        </div>
      </div>
    </Modal>
  );
};

export default AppSelector;
