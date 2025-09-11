/**
 * 监控表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message, Steps } from 'antd';
import http from '@/libs/http';
import useMonitorStore from '@/stores/monitorStore';

const MonitorForm: React.FC = () => {
  const {
    record,
    formVisible,
    page,
    groups,
    setFormVisible,
    setPage,
    fetchRecords
  } = useMonitorStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formVisible) {
      form.setFieldsValue({
        ...record,
        type: record.type || '1',
        rate: record.rate || 5
      });
    }
  }, [formVisible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        id: record.id,
        targets: record.targets || []
      };

      await http.post('/api/monitor/', formData);
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
      await form.validateFields(['name', 'group', 'type', 'rate']);
      setPage(1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handlePrev = () => {
    setPage(0);
  };

  const renderStep1 = () => (
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
      <Form.Item
        name="name"
        label="监控名称"
        rules={[{ required: true, message: '请输入监控名称' }]}
      >
        <Input placeholder="请输入监控名称" />
      </Form.Item>

      <Form.Item
        name="group"
        label="监控分组"
        rules={[{ required: true, message: '请选择监控分组' }]}
      >
        <Select placeholder="请选择监控分组">
          {groups.map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="type"
        label="监控类型"
        rules={[{ required: true, message: '请选择监控类型' }]}
      >
        <Select placeholder="请选择监控类型">
          <Select.Option value="1">端口监控</Select.Option>
          <Select.Option value="2">进程监控</Select.Option>
          <Select.Option value="3">网站监控</Select.Option>
          <Select.Option value="4">Ping监控</Select.Option>
          <Select.Option value="5">自定义监控</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="rate"
        label="监控频率"
        rules={[{ required: true, message: '请输入监控频率' }]}
      >
        <InputNumber
          min={1}
          max={1440}
          addonAfter="分钟"
          placeholder="请输入监控频率"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item name="desc" label="备注信息">
        <Input.TextArea placeholder="请输入监控备注信息" rows={3} />
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
        <strong>监控规则配置</strong>
      </div>
      <div style={{ color: '#666', marginBottom: 40 }}>
        简化版本暂时使用默认监控规则，完整版本中可以自定义监控规则和告警阈值
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
    { title: '设置规则' },
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
    </Modal>
  );
};

export default MonitorForm;
