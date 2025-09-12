/**
 * 模板表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Button, message } from 'antd';
import { ACEditor } from '@/components';
import HostSelector from '@/pages/host/Selector';
import Parameter from './Parameter';
import http from '@/libs/http';
import useTemplateStore from '@/stores/execTemplateStore';

const TemplateForm: React.FC = () => {
  const { record, formVisible, setFormVisible, fetchRecords } = useTemplateStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parameters, setParameters] = useState<any[]>([]);
  const [parameterVisible, setParameterVisible] = useState(false);

  useEffect(() => {
    if (formVisible) {
      form.setFieldsValue({
        ...record,
        interpreter: record.interpreter || 'sh',
        type: record.type || '',
        host_ids: record.host_ids || [],
      });
      setParameters(record.parameters || []);
    }
  }, [formVisible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        id: record.id,
        parameters,
      };

      await http.post('/api/exec/template/', formData);
      message.success('操作成功');
      setFormVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={formVisible}
        width={800}
        maskClosable={false}
        title={record.id ? '编辑模板' : '新建模板'}
        onCancel={() => setFormVisible(false)}
        confirmLoading={loading}
        onOk={handleSubmit}
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={record}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="模板类型"
            rules={[{ required: true, message: '请输入模板类型' }]}
          >
            <Input placeholder="请输入模板类型" />
          </Form.Item>

          <Form.Item
            name="interpreter"
            label="解释器"
            rules={[{ required: true, message: '请选择解释器' }]}
          >
            <Radio.Group>
              <Radio.Button value="sh">Shell</Radio.Button>
              <Radio.Button value="python">Python</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="body"
            label="脚本内容"
            rules={[{ required: true, message: '请输入脚本内容' }]}
          >
            <ACEditor
              mode={form.getFieldValue('interpreter') || 'sh'}
              height="200px"
              onChange={(value) => form.setFieldsValue({ body: value })}
            />
          </Form.Item>

          <Form.Item
            name="host_ids"
            label="默认主机"
          >
            <HostSelector type="button" />
          </Form.Item>

          <Form.Item label="参数设置">
            <Button onClick={() => setParameterVisible(true)}>
              设置参数 {parameters.length > 0 && `(${parameters.length})`}
            </Button>
          </Form.Item>

          <Form.Item name="desc" label="备注信息">
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {parameterVisible && (
        <Parameter
          parameters={parameters}
          onCancel={() => setParameterVisible(false)}
          onOk={(params) => {
            setParameters(params);
            setParameterVisible(false);
          }}
        />
      )}
    </>
  );
};

export default TemplateForm;
