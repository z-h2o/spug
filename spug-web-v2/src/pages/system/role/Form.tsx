/**
 * 系统角色管理表单组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import useSystemRoleStore from '@/stores/systemRoleStore';

const SystemRoleForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const { record, setFormVisible, submitForm } = useSystemRoleStore();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await submitForm(values);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      maskClosable={false}
      title={record.id ? '编辑角色' : '新建角色'}
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
          name="name" 
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入角色备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SystemRoleForm;
