/**
 * 应用管理表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import http from '@/libs/http';
import useDeployAppStore from '@/stores/deployAppStore';

const AppForm: React.FC = () => {
  const { record, formVisible, setFormVisible, fetchRecords } = useDeployAppStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formVisible) {
      form.setFieldsValue(record);
    }
  }, [form, record, formVisible]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const formData = form.getFieldsValue();
      formData.id = record.id;
      
      await http.post('/api/app/', formData);
      message.success('操作成功');
      setFormVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      open={formVisible}
      maskClosable={false}
      title={record.id ? '编辑应用' : '新建应用'}
      onCancel={handleCancel}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        labelCol={{ span: 6 }} 
        wrapperCol={{ span: 14 }}
      >
        <Form.Item 
          name="name" 
          label="应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称，例如：订单服务" />
        </Form.Item>
        <Form.Item
          name="key"
          label="唯一标识符"
          tooltip="给应用设置的唯一标识符，会用于配置中心的配置生成。"
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

export default AppForm;
