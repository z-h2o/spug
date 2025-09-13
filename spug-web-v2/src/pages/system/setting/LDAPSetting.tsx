/**
 * LDAP设置组件
 */
import React, { useState, useEffect } from 'react';
import { Form, Button, Input, Space, message } from 'antd';
import useSystemSettingStore from '@/stores/systemSettingStore';
import http from '@/libs/http';
import styles from './index.module.scss';

const LDAPSetting: React.FC = () => {
  const { settings, loading, fetchSettings } = useSystemSettingStore();
  const [form] = Form.useForm();
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.ldap_service) {
      form.setFieldsValue(settings.ldap_service);
    }
  }, [settings.ldap_service, form]);

  const handleSubmit = () => {
    const formData = form.getFieldsValue();
    http.post('/api/setting/', { data: [{ key: 'ldap_service', value: formData }] })
      .then(() => {
        message.success('保存成功');
        fetchSettings();
      });
  };

  const ldapTest = () => {
    setTestLoading(true);
    const formData = form.getFieldsValue();
    http.post('/api/setting/ldap_test/', formData)
      .then(() => {
        message.success('LDAP服务连接成功');
      })
      .finally(() => setTestLoading(false));
  };

  return (
    <React.Fragment>
      <div className={styles.title}>LDAP设置</div>
      <Form
        form={form}
        style={{ maxWidth: 400 }}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item required name="server" label="LDAP服务地址">
          <Input placeholder="例如：ldap.spug.cc" />
        </Form.Item>
        <Form.Item required name="port" label="LDAP服务端口">
          <Input placeholder="例如：389" />
        </Form.Item>
        <Form.Item required name="admin_dn" label="管理员DN">
          <Input placeholder="例如：cn=admin,dc=spug,dc=dev" />
        </Form.Item>
        <Form.Item required name="password" label="管理员密码">
          <Input.Password placeholder="请输入LDAP管理员密码" />
        </Form.Item>
        <Form.Item required name="rules" label="LDAP搜索规则">
          <Input placeholder="例如：cn" />
        </Form.Item>
        <Form.Item required name="base_dn" label="基本DN">
          <Input placeholder="例如：dc=spug,dc=dev" />
        </Form.Item>
        <Space>
          <Button type="primary" danger loading={testLoading} onClick={ldapTest}>
            测试LDAP
          </Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存设置
          </Button>
        </Space>
      </Form>
    </React.Fragment>
  );
};

export default LDAPSetting;
