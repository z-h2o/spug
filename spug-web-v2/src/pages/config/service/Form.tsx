/**
 * 配置服务表单组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import useConfigServiceStore from '@/stores/configServiceStore';

const ConfigServiceForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { record, setFormVisible, submitForm } = useConfigServiceStore();

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
      title={record.id ? '编辑服务' : '新建服务'}
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
          label="服务名称"
          tooltip="服务可以理解为一些配置的集合。"
          rules={[{ required: true, message: '请输入服务名称' }]}
        >
          <Input placeholder="请输入服务名称" />
        </Form.Item>
        <Form.Item
          required
          name="key"
          label="唯一标识符"
          tooltip="服务的唯一标识符，会作为生成配置的前缀。"
          extra="可以由字母、数字和下划线组成。"
          rules={[{ required: true, message: '请输入唯一标识符' }]}
        >
          <Input placeholder="请输入唯一标识符" />
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigServiceForm;
