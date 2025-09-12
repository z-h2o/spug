/**
 * 审核发布申请组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import useRequestStore from '@/stores/requestStore';
import http from '@/libs/http';

const Approve: React.FC = () => {
  const { 
    record, 
    approveVisible, 
    setApproveVisible, 
    fetchRecords 
  } = useRequestStore();
  
  const [form] = Form.useForm();
  const [isPass, setIsPass] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = form.getFieldsValue();
      await http.patch(`/api/deploy/request/${record.id}/`, formData);
      message.success('操作成功');
      setApproveVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('审核失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (changedValues: any) => {
    if (changedValues.is_pass !== undefined) {
      setIsPass(changedValues.is_pass);
    }
  };

  if (!approveVisible) return null;

  return (
    <Modal
      open={approveVisible}
      width={600}
      maskClosable={false}
      title="审核发布申请"
      onCancel={() => setApproveVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        labelCol={{ span: 6 }} 
        wrapperCol={{ span: 14 }}
        onValuesChange={handleChange}
      >
        <Form.Item 
          required 
          name="is_pass" 
          initialValue={true} 
          valuePropName="checked" 
          label="审批结果"
        >
          <Switch checkedChildren="通过" unCheckedChildren="驳回" />
        </Form.Item>
        <Form.Item 
          name="reason" 
          required={isPass === false} 
          label={isPass ? '审批意见' : '驳回原因'}
        >
          <Input.TextArea 
            placeholder={isPass ? '请输入审批意见' : '请输入驳回原因'} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Approve;
