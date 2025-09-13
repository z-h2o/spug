/**
 * 报警服务设置组件
 */
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Space, message } from 'antd';
import useSystemSettingStore from '@/stores/systemSettingStore';
import http from '@/libs/http';
import styles from './index.module.scss';

const AlarmSetting: React.FC = () => {
  const { settings, loading, fetchSettings } = useSystemSettingStore();
  const [form] = Form.useForm();
  const setting = settings.mail_service || {};
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.mail_service) {
      form.setFieldsValue(settings.mail_service);
    }
  }, [settings.mail_service, form]);

  const handleEmailTest = () => {
    setTestLoading(true);
    const formData = form.getFieldsValue();
    http
      .post('/api/setting/email_test/', formData)
      .then(() => {
        message.success('邮件服务连接成功');
      })
      .finally(() => setTestLoading(false));
  };

  const handleSubmit = () => {
    const formData = form.getFieldsValue();
    if (!formData.server || !formData.port || !formData.username || !formData.password) {
      return message.error('请完成邮件服务配置');
    }
    
    http
      .post('/api/setting/', { data: [{ key: 'mail_service', value: formData }] })
      .then(() => {
        message.success('保存成功');
        fetchSettings();
      });
  };

  return (
    <React.Fragment>
      <div className={styles.title}>报警服务设置</div>
      <div style={{ maxWidth: 340 }}>
        <Form.Item
          label="邮件服务"
          labelCol={{ span: 24 }}
          style={{ marginTop: 12 }}
          extra="用于通过邮件方式发送报警信息"
        >
          <div style={{ marginTop: 12 }}>
            <Form
              form={form}
              initialValues={setting}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
            >
              <Form.Item required name="server" label="邮件服务器">
                <Input placeholder="例如：smtp.exmail.qq.com" />
              </Form.Item>
              <Form.Item required name="port" label="端口">
                <Input placeholder="例如：465" />
              </Form.Item>
              <Form.Item required name="username" label="邮箱账号">
                <Input placeholder="例如：dev@exmail.com" />
              </Form.Item>
              <Form.Item required name="password" label="密码/授权码">
                <Input.Password placeholder="请输入对应的密码或授权码" />
              </Form.Item>
              <Form.Item name="nickname" label="发件人昵称">
                <Input placeholder="请输入发件人昵称" />
              </Form.Item>
            </Form>
          </div>
        </Form.Item>
        <Space style={{ marginTop: 24 }}>
          <Button type="primary" danger loading={testLoading} onClick={handleEmailTest}>
            测试邮件服务
          </Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存设置
          </Button>
        </Space>
      </div>
    </React.Fragment>
  );
};

export default AlarmSetting;
