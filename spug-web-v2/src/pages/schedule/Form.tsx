/**
 * 任务计划表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Button, message, Steps } from 'antd';
import http from '@/libs/http';
import useScheduleStore from '@/stores/scheduleStore';

const ScheduleForm: React.FC = () => {
  const {
    record,
    types,
    formVisible,
    page,
    setFormVisible,
    setPage,
    fetchRecords
  } = useScheduleStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState(record.command || '');

  useEffect(() => {
    if (formVisible) {
      form.setFieldsValue({
        ...record,
        interpreter: record.interpreter || 'sh',
        trigger: record.trigger || 'interval'
      });
      setCommand(record.command || '');
    }
  }, [formVisible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        command,
        id: record.id,
        targets: ['local'], // 简化版本，默认本机执行
        trigger_args: '{"rule": "interval", "time": "30"}' // 简化版本，默认30分钟间隔
      };

      await http.post('/api/schedule/', formData);
      message.success('操作成功');
      setFormVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields(['type', 'name', 'interpreter']);
      if (!command.trim()) {
        message.error('请输入任务内容');
        return;
      }
      setPage(page + 1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handlePrev = () => {
    setPage(page - 1);
  };

  const renderStep1 = () => (
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
      <Form.Item
        name="type"
        label="任务类型"
        rules={[{ required: true, message: '请选择任务类型' }]}
      >
        <Select placeholder="请选择任务类型">
          {types.map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="任务名称"
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input placeholder="请输入任务名称" />
      </Form.Item>

      <Form.Item
        name="interpreter"
        label="执行器"
        rules={[{ required: true, message: '请选择执行器' }]}
      >
        <Radio.Group>
          <Radio.Button value="sh">Shell</Radio.Button>
          <Radio.Button value="python">Python</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="任务内容"
        rules={[{ required: true, message: '请输入任务内容' }]}
      >
        <Input.TextArea
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="请输入要执行的命令或脚本"
          rows={6}
        />
      </Form.Item>

      <Form.Item name="desc" label="备注信息">
        <Input.TextArea placeholder="请输入任务备注信息" rows={3} />
      </Form.Item>

      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button type="primary" onClick={handleNext}>
          下一步
        </Button>
      </Form.Item>
    </Form>
  );

  const renderStep2 = () => (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 20, fontSize: 16 }}>
        <strong>执行对象：</strong>本机（简化版本）
      </div>
      <div style={{ color: '#666', marginBottom: 40 }}>
        在完整版本中，您可以选择多个主机作为执行对象
      </div>
      <div>
        <Button onClick={handlePrev} style={{ marginRight: 16 }}>
          上一步
        </Button>
        <Button type="primary" onClick={() => setPage(2)}>
          下一步
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 20, fontSize: 16 }}>
        <strong>触发器：</strong>时间间隔（简化版本）
      </div>
      <div style={{ color: '#666', marginBottom: 40 }}>
        默认每30分钟执行一次，在完整版本中可以自定义时间规则
      </div>
      <div>
        <Button onClick={handlePrev} style={{ marginRight: 16 }}>
          上一步
        </Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          提交
        </Button>
      </div>
    </div>
  );

  const steps = [
    { title: '创建任务' },
    { title: '选择执行对象' },
    { title: '设置触发器' },
  ];

  return (
    <Modal
      open={formVisible}
      width={800}
      maskClosable={false}
      title={record.id ? '编辑任务' : '新建任务'}
      onCancel={() => setFormVisible(false)}
      footer={null}
    >
      <Steps current={page} style={{ marginBottom: 32 }}>
        {steps.map((step, index) => (
          <Steps.Step key={index} title={step.title} />
        ))}
      </Steps>

      {page === 0 && renderStep1()}
      {page === 1 && renderStep2()}
      {page === 2 && renderStep3()}
    </Modal>
  );
};

export default ScheduleForm;
