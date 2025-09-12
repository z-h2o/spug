/**
 * 环境管理表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import http from '@/libs/http';
import useConfigEnvStore from '@/stores/configEnvStore';

const EnvForm: React.FC = () => {
  const { record, formVisible, setFormVisible, fetchRecords } = useConfigEnvStore();
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
      
      await http.post('/api/config/environment/', formData);
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
      title={record.id ? '编辑环境' : '新建环境'}
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
          label="环境名称"
          rules={[{ required: true, message: '请输入环境名称' }]}
        >
          <Input placeholder="请输入环境名称，例如：开发环境" />
        </Form.Item>
        <Form.Item
          name="key"
          label="唯一标识符"
          tooltip="环境的唯一标识符，会在配置中心API中使用，具体请参考官方文档。"
          extra="可以由字母、数字和下划线组成。"
          rules={[{ required: true, message: '请输入唯一标识符' }]}
        >
          <Input placeholder="请输入唯一标识符，例如：dev" />
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EnvForm;
