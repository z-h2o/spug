/**
 * 开放服务设置组件
 */
import React, { useEffect } from 'react';
import { Form, Button, Input, message } from 'antd';
import useSystemSettingStore from '@/stores/systemSettingStore';
import http from '@/libs/http';
import styles from './index.module.scss';

const OpenService: React.FC = () => {
  const { settings, loading, fetchSettings, updateSetting } = useSystemSettingStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = () => {
    const value = settings.api_key;
    http
      .post('/api/setting/', { data: [{ key: 'api_key', value }] })
      .then(() => {
        message.success('保存成功');
        fetchSettings();
      });
  };

  return (
    <React.Fragment>
      <div className={styles.title}>开放服务设置</div>
      <Form layout="vertical" style={{ maxWidth: 320 }}>
        <Form.Item
          colon={false}
          label="访问凭据"
          extra="该自定义凭据用于访问平台的开放服务，例如：配置中心的配置获取API等，其他开放服务请查询官方文档。"
        >
          <Input
            value={settings.api_key || ''}
            onChange={(e) => updateSetting('api_key', e.target.value)}
            placeholder="请输入自定义Token"
          />
        </Form.Item>
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </React.Fragment>
  );
};

export default OpenService;
