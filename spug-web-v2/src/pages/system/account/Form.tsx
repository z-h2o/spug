/**
 * 账户表单组件
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Form, Select, Input, message } from 'antd';
import http from '@/libs/http';
import { includes } from '@/utils/helper';
import useAccountStore from '@/stores/accountStore';
import useRoleStore from '@/stores/roleStore';

const AccountForm: React.FC = () => {
  const { record, formVisible, setFormVisible, fetchRecords } = useAccountStore();
  const { records: roleRecords } = useRoleStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    http.get('/api/alarm/contact/?only_push=1')
      .then((res: any) => setContacts(res))
      .catch(() => setContacts([])); // 如果获取联系人失败，设置为空数组
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    const formData = form.getFieldsValue();
    formData.id = record.id;
    
    http.post('/api/account/user/', formData)
      .then(() => {
        message.success('操作成功');
        setFormVisible(false);
        fetchRecords();
      })
      .catch(() => setLoading(false));
  };

  return (
    <Modal
      open={formVisible}
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
          required 
          name="username" 
          label="登录名"
          rules={[{ required: true, message: '请输入登录名' }]}
        >
          <Input placeholder="请输入登录名" />
        </Form.Item>
        
        <Form.Item 
          required 
          name="nickname" 
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        
        <Form.Item
          required={!record.id}
          name="password"
          label="密码"
          style={{ display: record.id ? 'none' : 'block' }}
          extra="至少8位包含数字、小写和大写字母。"
          rules={record.id ? [] : [{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item 
          label="角色" 
          style={{ 
            marginBottom: 0,
            display: record.is_supper ? 'none' : 'block'
          }}
        >
          <Form.Item
            name="role_ids"
            style={{ display: 'inline-block', width: '80%' }}
            extra="权限最大化原则，组合多个角色权限。"
          >
            <Select mode="multiple" placeholder="请选择">
              {roleRecords.map(item => (
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
          extra={
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
          }
        >
          <Select
            showSearch
            allowClear
            filterOption={(input, option: any) => includes(option.children, input)}
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

export default AccountForm;
