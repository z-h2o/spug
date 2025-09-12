/**
 * 监控管理Step2组件
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Radio, Transfer, Checkbox, Button, message } from 'antd';
import http from '@/libs/http';
import useAlarmGroupStore from '@/stores/alarmGroupStore';
import useMonitorStore from '@/stores/monitorStore';

const modeOptions = [
  { label: '微信', value: '1' },
  { label: '短信', value: '2' },
  { label: '电话', value: '6' },
  { label: '邮件', value: '4' },
  { label: '钉钉', value: '3' },
  { label: '企业微信', value: '5' },
];

const MonitorStep2: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { records: groupRecords } = useAlarmGroupStore();
  const { 
    record, 
    setPage, 
    setFormVisible, 
    fetchRecords, 
    fetchOverviews 
  } = useMonitorStore();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = await form.validateFields();
      const submitData = {
        ...formData,
        id: record.id,
        name: record.name,
        desc: record.desc,
        targets: record.targets,
        extra: record.extra,
        type: record.type,
        group: record.group
      };
      
      await http.post('/api/monitor/', submitData);
      message.success('操作成功');
      setFormVisible(false);
      fetchRecords();
      fetchOverviews();
    } catch (error) {
      // Error handled by http interceptor or form validation
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    const { notify_grp, notify_mode } = form.getFieldsValue();
    return notify_grp && notify_grp.length && notify_mode && notify_mode.length;
  };

  return (
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
      <Form.Item 
        name="rate" 
        initialValue={record.rate || 5} 
        label="监控频率" 
        tooltip="每隔N分钟检测一次"
      >
        <Radio.Group>
          <Radio value={1}>1分钟</Radio>
          <Radio value={5}>5分钟</Radio>
          <Radio value={15}>15分钟</Radio>
          <Radio value={30}>30分钟</Radio>
          <Radio value={60}>60分钟</Radio>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item 
        name="threshold" 
        initialValue={record.threshold || 3} 
        label="报警阈值" 
        tooltip="连续N次检测失败，则发送告警"
      >
        <Radio.Group>
          <Radio value={1}>1次</Radio>
          <Radio value={2}>2次</Radio>
          <Radio value={3}>3次</Radio>
          <Radio value={4}>4次</Radio>
          <Radio value={5}>5次</Radio>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item 
        required 
        name="notify_grp" 
        valuePropName="targetKeys" 
        initialValue={record.notify_grp} 
        label="报警联系人组"
        extra={
          <>
            去创建 <Link to="/alarm/contact">报警联系人</Link> 和{' '}
            <Link to="/alarm/group">联系人组</Link>。
          </>
        }
        rules={[{ required: true, message: '请选择报警联系人组' }]}
      >
        <Transfer
          rowKey={(item: any) => item.id}
          titles={['已有联系组', '已选联系组']}
          listStyle={{ width: 199 }}
          dataSource={groupRecords}
          render={(item: any) => item.name}
        />
      </Form.Item>
      
      <Form.Item 
        required 
        name="notify_mode" 
        initialValue={record.notify_mode} 
        label="报警方式"
        rules={[{ required: true, message: '请选择报警方式' }]}
      >
        <Checkbox.Group options={modeOptions} />
      </Form.Item>
      
      <Form.Item 
        name="quiet" 
        initialValue={record.quiet || 24 * 60} 
        label="通道沉默" 
        extra="相同的告警信息，沉默期内只发送一次。"
      >
        <Select placeholder="请选择">
          <Select.Option value={5}>5分钟</Select.Option>
          <Select.Option value={10}>10分钟</Select.Option>
          <Select.Option value={15}>15分钟</Select.Option>
          <Select.Option value={30}>30分钟</Select.Option>
          <Select.Option value={60}>60分钟</Select.Option>
          <Select.Option value={3 * 60}>3小时</Select.Option>
          <Select.Option value={6 * 60}>6小时</Select.Option>
          <Select.Option value={12 * 60}>12小时</Select.Option>
          <Select.Option value={24 * 60}>24小时</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }} style={{ marginTop: 12 }}>
        <Button disabled={!canNext()} loading={loading} type="primary" onClick={handleSubmit}>
          提交
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={() => setPage(0)}>
          上一步
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MonitorStep2;
