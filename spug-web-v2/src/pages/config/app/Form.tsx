/**
 * 配置应用表单组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import useConfigAppStore from '@/stores/configAppStore';

const ConfigAppForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { record, setFormVisible, submitForm } = useConfigAppStore();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await submitForm(values);
    } catch (error) {
      // Form validation error or submit error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      maskClosable={false}
      title={record.id ? '编辑应用' : '新建应用'}
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
          name="name" 
          label="应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称，例如：订单服务" />
        </Form.Item>
        <Form.Item
          required
          name="key"
          label="唯一标识符"
          tooltip="应用的唯一标识符，会作为生成配置的前缀。"
          extra="可以由字母、数字和下划线组成。"
          rules={[{ required: true, message: '请输入唯一标识符' }]}
        >
          <Input placeholder="请输入唯一标识符，例如：api_order" />
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigAppForm;
