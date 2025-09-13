/**
 * 系统账户管理表单组件
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Form, Select, Input } from 'antd';
import http from '@/libs/http';
import { includes } from '@/utils/functools';
import useSystemAccountStore from '@/stores/systemAccountStore';
import useSystemRoleStore from '@/stores/systemRoleStore';

interface Contact {
  id: number;
  name: string;
}

const SystemAccountForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const { record, setFormVisible, submitForm } = useSystemAccountStore();
  const { records: roles, fetchRecords: fetchRoles } = useSystemRoleStore();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles, fetchRoles]);

  useEffect(() => {
    http.get('/api/alarm/contact/?only_push=1')
      .then(res => setContacts(res.data || res))
      .catch(() => setContacts([]));
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    const formData = form.getFieldsValue();
    formData.id = record.id;
    submitForm(formData).finally(() => setLoading(false));
  };

  return (
    <Modal
      open
      width={700}
      maskClosable={false}
      title={record.id ? '编辑账户' : '新建账户'}
      onCancel={() => setFormVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        initialValues={record} 
        labelCol={{ span: 6 }} 
        wrapperCol={{ span: 14 }}
      >
        <Form.Item 
          name="username" 
          label="登录名"
          rules={[{ required: true, message: '请输入登录名' }]}
        >
          <Input placeholder="请输入登录名" />
        </Form.Item>
        
        <Form.Item 
          name="nickname" 
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        
        <Form.Item 
          name="password" 
          label="密码"
          hidden={!!record.id}
          rules={[
            { required: !record.id, message: '请输入密码' },
            { min: 8, message: '密码至少8位' }
          ]}
          extra="至少8位包含数字、小写和大写字母。"
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item 
          label="角色" 
          style={{ marginBottom: 0 }}
          hidden={record.is_supper}
        >
          <Form.Item 
            name="role_ids" 
            style={{ display: 'inline-block', width: '80%' }}
            extra="权限最大化原则，组合多个角色权限。"
          >
            <Select mode="multiple" placeholder="请选择">
              {roles.map(item => (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ display: 'inline-block', width: '20%', textAlign: 'right' }}>
            <Link to="/system/role">新建角色</Link>
          </Form.Item>
        </Form.Item>
        
        <Form.Item
          name="wx_token"
          label="MFA标识"
          extra={(
            <span>
              如果启用了MFA（两步验证）则该项为必填。
              <a 
                target="_blank" 
                rel="noopener noreferrer" 
                href="https://push.spug.cc/guide/spug"
              >
                如何获取MFA标识？
              </a>
            </span>
          )}
        >
          <Select 
            showSearch 
            allowClear 
            filterOption={(input, option) => 
              includes((option?.children as any) || '', input)
            }
            placeholder="请选择绑定推送标识"
          >
            {contacts.map(item => (
              <Select.Option value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SystemAccountForm;