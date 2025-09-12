/**
 * 配置应用依赖关系组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Transfer, Tabs } from 'antd';
import { hasPermission } from '@/utils/functools';
import useConfigAppStore from '@/stores/configAppStore';
import useConfigServiceStore from '@/stores/configServiceStore';

const ConfigAppRel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { 
    record, 
    confRel, 
    records,
    setRelVisible, 
    submitRel,
    updateConfRel 
  } = useConfigAppStore();
  const { 
    records: serviceRecords, 
    fetchRecords: fetchServiceRecords 
  } = useConfigServiceStore();

  useEffect(() => {
    if (serviceRecords.length === 0) {
      fetchServiceRecords();
    }
  }, [serviceRecords.length, fetchServiceRecords]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await submitRel();
    } catch (error) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  // 过滤掉当前应用
  const appDataSource = records
    .filter(x => x.id !== record.id)
    .map(x => ({ ...x, key: x.id, _key: x.key }));

  const serviceDataSource = serviceRecords.map(x => ({
    ...x,
    key: x.id,
    _key: x.key
  }));

  return (
    <Modal
      open
      width={700}
      maskClosable={false}
      title="配置服务依赖"
      onCancel={() => setRelVisible(false)}
      confirmLoading={loading}
      footer={hasPermission('config.app.edit_config') ? undefined : null}
      onOk={handleSubmit}
    >
      <Tabs tabPosition="left">
        <Tabs.TabPane tab="应用依赖" key="app">
          <Form.Item extra="设置依赖后，该应用将能够获取到所依赖应用的配置。">
            <Transfer
              listStyle={{ width: 280, minHeight: 300 }}
              titles={['所有应用', '已选应用']}
              dataSource={appDataSource}
              targetKeys={confRel.app}
              onChange={(keys) => updateConfRel('app', keys as number[])}
              render={(item: any) => `${item.name}(${item._key})`}
            />
          </Form.Item>
        </Tabs.TabPane>
        <Tabs.TabPane tab="服务依赖" key="service">
          <Form.Item extra="设置依赖后，该应用将能够获取到所依赖服务的配置。">
            <Transfer
              listStyle={{ width: 280, minHeight: 300 }}
              titles={['所有服务', '已选服务']}
              dataSource={serviceDataSource}
              targetKeys={confRel.service}
              onChange={(keys) => updateConfRel('service', keys as number[])}
              render={(item: any) => `${item.name}(${item._key})`}
            />
          </Form.Item>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default ConfigAppRel;
