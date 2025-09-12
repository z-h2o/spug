/**
 * 报警组表单组件
 */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Transfer, Spin } from 'antd';
import http from '@/libs/http';
import useAlarmGroupStore from '@/stores/alarmGroupStore';

interface Contact {
  id: number;
  name: string;
}

const AlarmGroupForm: React.FC = () => {
  const [form] = Form.useForm();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { record, setFormVisible, submitForm } = useAlarmGroupStore();

  useEffect(() => {
    setFetching(true);
    http.get('/api/alarm/contact/?with_push=1')
      .then(res => setContacts(res.data || res))
      .finally(() => setFetching(false));
  }, []);

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
      width={800}
      maskClosable={false}
      title={record.id ? '编辑联系组' : '新建联系组'}
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
          label="组名称"
          rules={[{ required: true, message: '请输入联系组名称' }]}
        >
          <Input placeholder="请输入联系组名称" />
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入备注信息" />
        </Form.Item>
        <Spin spinning={fetching}>
          <Form.Item 
            required 
            name="contacts" 
            valuePropName="targetKeys" 
            label="选择联系人"
            rules={[{ required: true, message: '请选择联系人' }]}
          >
            <Transfer
              rowKey={(item: Contact) => item.id}
              titles={['已有联系人', '已选联系人']}
              listStyle={{ width: 199 }}
              dataSource={contacts}
              render={(item: Contact) => item.name}
            />
          </Form.Item>
        </Spin>
      </Form>
    </Modal>
  );
};

export default AlarmGroupForm;
