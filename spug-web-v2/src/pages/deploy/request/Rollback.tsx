/**
 * 回滚发布组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { includes } from '@/utils/common';
import useRequestStore from '@/stores/requestStore';
import HostSelector from './HostSelector';
import http from '@/libs/http';
import dayjs from 'dayjs';

const Rollback: React.FC = () => {
  const { 
    record, 
    records,
    rollbackVisible, 
    setRollbackVisible, 
    fetchRecords 
  } = useRequestStore();
  
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hostIds, setHostIds] = useState<number[]>([]);

  useEffect(() => {
    const { app_host_ids, host_ids } = record;
    setHostIds([...(host_ids || app_host_ids || [])]);
  }, [record]);

  const handleSubmit = async () => {
    if (hostIds.length === 0) {
      return message.error('请至少选择一个要发布的主机');
    }
    
    try {
      setLoading(true);
      const formData = form.getFieldsValue();
      formData.host_ids = hostIds;
      await http.post('/api/deploy/request/ext1/rollback/', formData);
      message.success('操作成功');
      setRollbackVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('回滚失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const { app_host_ids = [], deploy_id } = record;
  
  // 过滤可回滚的版本
  const rollbackOptions = records.filter(x => 
    x.rb_id && 
    x.deploy_id === deploy_id && 
    ['3', '-3'].includes(x.status)
  );

  if (!rollbackVisible) return null;

  return (
    <Modal
      open={rollbackVisible}
      width={600}
      maskClosable={false}
      title="新建回滚发布申请"
      onCancel={() => setRollbackVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        initialValues={record} 
        labelCol={{ span: 5 }} 
        wrapperCol={{ span: 17 }}
      >
        <Form.Item required name="name" label="申请标题">
          <Input placeholder="请输入申请标题" />
        </Form.Item>
        
        <Form.Item 
          required 
          name="request_id" 
          label="选择版本"
          tooltip="可选择回滚版本与发布配置中的版本数量配置相关。"
        >
          <Select
            showSearch
            placeholder="请选择回滚至哪个版本"
            filterOption={(input: string, option: any) => 
              includes(option?.children?.props?.children?.[0]?.props?.children || '', input)
            }
          >
            {rollbackOptions.map((item, index) => (
              <Select.Option 
                key={item.id} 
                value={item.id} 
                disabled={index === 0}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{`${item.name} (${item.version})`}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    创建于 {dayjs(item.created_at).fromNow()}
                  </span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item 
          required 
          label="目标主机"
          tooltip="可以通过创建多个发布申请单，选择主机分批发布。"
        >
          {hostIds.length > 0 && (
            <span style={{ marginRight: 16 }}>
              已选择 {hostIds.length} 台（可选{app_host_ids.length}）
            </span>
          )}
          <Button 
            type="link" 
            style={{ padding: 0 }} 
            onClick={() => setVisible(true)}
          >
            选择主机
          </Button>
        </Form.Item>
        
        <Form.Item name="desc" label="备注信息">
          <Input placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
      
      {visible && (
        <HostSelector
          host_ids={hostIds}
          app_host_ids={app_host_ids}
          onCancel={() => setVisible(false)}
          onOk={(ids: number[]) => {
            setHostIds(ids);
            setVisible(false);
          }}
        />
      )}
    </Modal>
  );
};

export default Rollback;
