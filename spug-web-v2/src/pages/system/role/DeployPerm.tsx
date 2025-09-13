/**
 * 发布权限管理组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Transfer, message, Tabs, Alert } from 'antd';
import http from '@/libs/http';
import useConfigEnvStore from '@/stores/configEnvStore';
import useConfigAppStore from '@/stores/configAppStore';
import useSystemRoleStore from '@/stores/systemRoleStore';

interface EnvRecord {
  id: number;
  key: string;
  name: string;
  _key: string;
}

interface AppRecord {
  id: number;
  key: string;
  name: string;
  _key: string;
}

const DeployPerm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [envs, setEnvs] = useState<EnvRecord[]>([]);
  const [apps, setApps] = useState<AppRecord[]>([]);
  
  const { 
    record, 
    deployRel, 
    setDeployPermVisible, 
    fetchRecords,
    updateDeployRel
  } = useSystemRoleStore();
  
  const { records: envRecords, fetchRecords: fetchEnvs } = useConfigEnvStore();
  const { records: appRecords, fetchRecords: fetchApps } = useConfigAppStore();

  useEffect(() => {
    const loadEnvs = async () => {
      if (envRecords.length === 0) {
        await fetchEnvs();
      }
    };
    
    const loadApps = async () => {
      if (appRecords.length === 0) {
        await fetchApps();
      }
    };
    
    loadEnvs();
    loadApps();
  }, [envRecords.length, appRecords.length, fetchEnvs, fetchApps]);

  useEffect(() => {
    if (envRecords.length > 0) {
      updateRecords(envRecords, 'envs');
    }
  }, [envRecords]);

  useEffect(() => {
    if (appRecords.length > 0) {
      updateRecords(appRecords, 'apps');
    }
  }, [appRecords]);

  const updateRecords = (records: any[], key: 'envs' | 'apps') => {
    const data = records.map(x => ({
      ...x,
      key: x.id,
      _key: x.key
    }));
    if (key === 'envs') {
      setEnvs(data);
    } else {
      setApps(data);
    }
  };

  const handleSubmit = async () => {
    const envIds = deployRel.envs || [];
    const appIds = deployRel.apps || [];
    
    if (!(envIds.length === 0 && appIds.length === 0)) {
      if (envIds.length === 0) {
        message.error('请至少设置一个环境权限');
        return;
      }
      if (appIds.length === 0) {
        message.error('请至少设置一个应用权限');
        return;
      }
    }
    
    setLoading(true);
    try {
      await http.patch('/api/account/role/', { 
        id: record.id, 
        deploy_perms: { envs: envIds, apps: appIds } 
      });
      message.success('操作成功');
      setDeployPermVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to update deploy permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (inputValue: string, option: any) => {
    const keywords = inputValue.toLowerCase();
    return `${option.name} - ${option._key}`.toLowerCase().includes(keywords);
  };

  return (
    <Modal
      open
      width={800}
      maskClosable={false}
      title="发布权限设置"
      onCancel={() => setDeployPermVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Alert
        closable
        showIcon
        type="info"
        style={{ margin: '0 24px 24px 24px' }}
        message="环境权限和应用权限都需要设置，应用的创建者将默认拥有该应用的发布权限。"
      />
      
      <Tabs tabPosition="left">
        <Tabs.TabPane tab="环境权限" key="env">
          <Form.Item label="设置可发布至哪个环境">
            <Transfer
              showSearch
              listStyle={{ width: 280, minHeight: 300 }}
              titles={['所有环境', '已选环境']}
              dataSource={envs}
              targetKeys={deployRel.envs}
              filterOption={handleFilter}
              onChange={(keys) => updateDeployRel('envs', keys)}
              render={(item) => `${item.name} - ${item._key}`}
            />
          </Form.Item>
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="应用权限" key="app">
          <Form.Item label="设置可发布的应用">
            <Transfer
              showSearch
              listStyle={{ width: 280, minHeight: 300 }}
              titles={['所有应用', '已选应用']}
              dataSource={apps}
              targetKeys={deployRel.apps}
              filterOption={handleFilter}
              onChange={(keys) => updateDeployRel('apps', keys)}
              render={(item) => `${item.name} - ${item._key}`}
            />
          </Form.Item>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default DeployPerm;
