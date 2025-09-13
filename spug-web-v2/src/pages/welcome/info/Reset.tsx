/**
 * 修改密码组件
 */
import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import http from '@/libs/http';
import styles from './index.module.scss';

const Reset: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [new2Password, setNew2Password] = useState('');

  const handleSubmit = async () => {
    if (!oldPassword) {
      return message.error('请输入原密码');
    } else if (!newPassword) {
      return message.error('请输入新密码');
    } else if (newPassword !== new2Password) {
      return message.error('两次输入密码不一致');
    }

    try {
      setLoading(true);
      await http.patch('/api/account/self/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      message.success('密码修改成功');
      navigate('/');
      http.get('/api/account/logout/');
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className={styles.title}>修改密码</div>
      <Form 
        style={{ maxWidth: 320 }} 
        labelCol={{ span: 6 }} 
        wrapperCol={{ span: 18 }}
      >
        <Form.Item 
          label="原密码"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password 
            value={oldPassword} 
            placeholder="请输入" 
            onChange={e => setOldPassword(e.target.value)} 
          />
        </Form.Item>
        <Form.Item 
          label="新密码" 
          extra="至少8位包含数字、小写和大写字母。"
          rules={[{ required: true, message: '请输入新密码' }]}
        >
          <Input.Password 
            value={newPassword} 
            placeholder="请输入新密码" 
            onChange={e => setNewPassword(e.target.value)} 
          />
        </Form.Item>
        <Form.Item 
          label="再次确认"
          rules={[{ required: true, message: '请再次输入新密码' }]}
        >
          <Input.Password 
            value={new2Password} 
            placeholder="请再次输入新密码" 
            onChange={e => setNew2Password(e.target.value)} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </React.Fragment>
  );
};

export default Reset;
