/**
 * 参数输入组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';

interface ParameterItem {
  key: string;
  name: string;
  required?: boolean;
  default?: string;
  desc?: string;
}

interface ParameterProps {
  parameters: ParameterItem[];
  onCancel: () => void;
  onOk: (values: Record<string, string>) => void;
}

const Parameter: React.FC<ParameterProps> = ({ parameters, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('参数验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const initialValues = parameters.reduce((acc, param) => {
    acc[param.key] = param.default || '';
    return acc;
  }, {} as Record<string, string>);

  return (
    <Modal
      title="输入参数"
      open={true}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        {parameters.map(param => (
          <Form.Item
            key={param.key}
            name={param.key}
            label={param.name}
            extra={param.desc}
            rules={param.required ? [
              { required: true, message: `请输入${param.name}` }
            ] : []}
          >
            <Input placeholder={`请输入${param.name}`} />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default Parameter;
