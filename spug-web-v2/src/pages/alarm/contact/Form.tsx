/**
 * 报警联系人表单组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input, Tooltip, message } from 'antd';
import { ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import useAlarmContactStore from '@/stores/alarmContactStore';

interface TestProps {
  mode: string;
  name: string;
  testLoading: string;
  onTest: (mode: string, name: string) => void;
}

const Test: React.FC<TestProps> = ({ mode, name, testLoading, onTest }) => (
  <div style={{ position: 'absolute', right: -30, top: 8 }}>
    {testLoading === mode ? (
      <LoadingOutlined style={{ fontSize: 18, color: '#faad14' }} />
    ) : (
      <Tooltip title="执行测试">
        <ThunderboltOutlined
          style={{ fontSize: 18, color: '#faad14' }}
          onClick={() => onTest(mode, name)}
        />
      </Tooltip>
    )}
  </div>
);

const AlarmContactForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState('0');
  const { record, setFormVisible, submitForm } = useAlarmContactStore();

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

  const handleTest = async (mode: string, name: string) => {
    const value = form.getFieldValue(name);
    if (!value) {
      message.error('请输入后再执行测试');
      return;
    }
    
    try {
      setTestLoading(mode);
      await http.post('/api/alarm/test/', { mode, value });
      message.success('执行成功');
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setTestLoading('0');
    }
  };

  return (
    <Modal
      open
      width={800}
      maskClosable={false}
      title={record.id ? '编辑联系人' : '新建联系人'}
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
          label="姓名"
          rules={[{ required: true, message: '请输入联系人姓名' }]}
        >
          <Input placeholder="请输入联系人姓名" />
        </Form.Item>
        <Form.Item name="phone" label="手机号">
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item label="邮箱">
          <Form.Item noStyle name="email">
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          <Test mode="4" name="email" testLoading={testLoading} onTest={handleTest} />
        </Form.Item>
        <Form.Item 
          label="钉钉" 
          extra={
            <span>
              钉钉收不到通知？请参考
              <a 
                target="_blank" 
                rel="noopener noreferrer"
                href="https://ops.spug.cc/docs/use-problem#use-dd"
              >
                官方文档
              </a>
            </span>
          }
        >
          <Form.Item noStyle name="ding">
            <Input placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" />
          </Form.Item>
          <Test mode="3" name="ding" testLoading={testLoading} onTest={handleTest} />
        </Form.Item>
        <Form.Item label="企业微信">
          <Form.Item noStyle name="qy_wx">
            <Input placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx" />
          </Form.Item>
          <Test mode="5" name="qy_wx" testLoading={testLoading} onTest={handleTest} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AlarmContactForm;
