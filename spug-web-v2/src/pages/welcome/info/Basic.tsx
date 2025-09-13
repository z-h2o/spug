/**
 * 基本设置组件
 */
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Spin, message } from 'antd';
import http from '@/libs/http';
import useWelcomeStore from '@/stores/welcomeStore';
import styles from './index.module.scss';

const Basic: React.FC = () => {
  const [form] = Form.useForm();
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, fetchUser } = useWelcomeStore();

  useEffect(() => {
    if (!user.nickname) {
      setFetching(true);
      fetchUser()
        .then(() => form.setFieldsValue(user))
        .finally(() => setFetching(false));
    }
  }, [user, fetchUser, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await http.patch('/api/account/self/', values);
      message.success('保存成功，昵称将在重新登录或刷新页面后生效');
      localStorage.setItem('nickname', values.nickname);
      fetchUser();
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={fetching}>
      <div className={styles.title}>基本设置</div>
      <Form 
        form={form} 
        layout="vertical" 
        style={{ maxWidth: 320 }} 
        initialValues={user}
      >
        <Form.Item 
          name="nickname" 
          label="昵称"
          rules={[{ required: true, message: '请输入昵称' }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default Basic;
