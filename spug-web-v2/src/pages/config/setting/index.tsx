/**
 * 配置设置页面
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, Input, Button, Radio, Form, Alert, Modal } from 'antd';
import {
  DiffOutlined,
  HistoryOutlined,
  NumberOutlined,
  TableOutlined,
  UnorderedListOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { AuthDiv, AuthButton, Breadcrumb } from '@/components';
import useConfigEnvStore from '@/stores/configEnvStore';
import styles from './index.module.scss';

const ConfigSetting: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState('1');
  const [f_name, setFName] = useState('');
  const [currentEnv, setCurrentEnv] = useState<any>({});
  
  const { records: envRecords, fetchRecords: fetchEnvRecords } = useConfigEnvStore();

  useEffect(() => {
    fetchEnvRecords().then(() => {
      if (envRecords.length === 0) {
        Modal.error({
          title: '无可用环境',
          content: (
            <div>
              配置依赖应用的运行环境，请在 <a href="/config/environment">环境管理</a> 中创建环境。
            </div>
          )
        });
      } else {
        setCurrentEnv(envRecords[0]);
      }
    });
  }, [fetchEnvRecords, envRecords]);

  const handleEnvSelect = ({ key }: { key: string }) => {
    const env = envRecords.find(item => String(item.id) === key);
    if (env) {
      setCurrentEnv(env);
    }
  };

  const isApp = type === 'app';

  return (
    <AuthDiv auth={`config.${type}.view_config`}>
      <Breadcrumb 
        extra={
          <Alert 
            message="4.0将移除公共/私有配置概念，所有配置将被视为公共配置。" 
            banner 
          />
        }
      >
        <Breadcrumb.Item>配置中心</Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate(-1)}>
          {isApp ? '应用配置' : '服务配置'}
        </Breadcrumb.Item>
        <Breadcrumb.Item>配置详情</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className={styles.container}>
        <div className={styles.left}>
          <div style={{ padding: '0 0 10px 10px' }}>
            <h4>环境列表</h4>
            <Button 
              type="link" 
              icon={<DiffOutlined />}
              onClick={() => {/* 对比配置功能 */}}
            >
              对比配置
            </Button>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[String(currentEnv.id)]}
            style={{ border: 'none' }}
            onSelect={handleEnvSelect}
          >
            {envRecords.map(item => (
              <Menu.Item key={item.id}>
                {item.name} ({item.key})
              </Menu.Item>
            ))}
          </Menu>
        </div>
        
        <div className={styles.right}>
          <Form layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item label="视图" style={{ paddingLeft: 0 }}>
              <Radio.Group value={view} onChange={e => setView(e.target.value)}>
                <Radio.Button value="1">
                  <TableOutlined title="表格视图" />
                </Radio.Button>
                <Radio.Button value="2">
                  <UnorderedListOutlined title="文本视图" />
                </Radio.Button>
                <Radio.Button value="3">
                  <NumberOutlined title="JSON视图" />
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Key">
              <Input 
                allowClear 
                value={f_name} 
                onChange={e => setFName(e.target.value)}
                placeholder="请输入" 
              />
            </Form.Item>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <AuthButton
                auth="config.app.edit_config|config.service.edit_config"
                disabled={view !== '1'}
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {/* 新增配置功能 */}}
              >
                新增配置
              </AuthButton>
              <Button
                type="primary"
                style={{ backgroundColor: 'orange', borderColor: 'orange' }}
                icon={<HistoryOutlined />}
                onClick={() => {/* 更改历史功能 */}}
              >
                更改历史
              </Button>
            </div>
          </Form>

          <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '4px' }}>
            <h3>配置管理</h3>
            <p>环境: {currentEnv.name}</p>
            <p>视图模式: {view === '1' ? '表格视图' : view === '2' ? '文本视图' : 'JSON视图'}</p>
            <p>配置详细功能正在开发中，敬请期待...</p>
          </div>
        </div>
      </div>
    </AuthDiv>
  );
};

export default ConfigSetting;
