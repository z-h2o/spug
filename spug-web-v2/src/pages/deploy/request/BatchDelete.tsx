/**
 * 批量删除发布申请组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, DatePicker, Space, message } from 'antd';
import { includes } from '@/utils/common';
import useRequestStore from '@/stores/requestStore';
import useConfigAppStore from '@/stores/configAppStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import http from '@/libs/http';
import dayjs, { Dayjs } from 'dayjs';

const BatchDelete: React.FC = () => {
  const { 
    batchVisible, 
    setBatchVisible, 
    fetchRecords 
  } = useRequestStore();
  
  const { records: appRecords, fetchRecords: fetchAppRecords } = useConfigAppStore();
  const { records: envRecords, fetchRecords: fetchEnvRecords } = useConfigEnvStore();
  
  const [mode, setMode] = useState('expire');
  const [value, setValue] = useState<any>();
  const [appId, setAppId] = useState<number>();
  const [envId, setEnvId] = useState<number>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batchVisible) {
      if (appRecords.length === 0) fetchAppRecords();
      if (envRecords.length === 0) fetchEnvRecords();
    }
  }, [batchVisible, appRecords.length, envRecords.length, fetchAppRecords, fetchEnvRecords]);

  const handleSubmit = async () => {
    const formData: any = { mode, value };
    
    if (mode === 'deploy') {
      if (!appId || !envId) {
        return message.error('请选择要删除的应用和环境');
      }
      formData.value = `${appId},${envId}`;
    } else if (mode === 'expire') {
      if (!value) {
        return message.error('请选择截止日期');
      }
      formData.value = (value as Dayjs).format('YYYY-MM-DD');
    } else if (!value) {
      return message.error('请输入保留个数');
    }
    
    try {
      setLoading(true);
      const res = await http.delete('/api/deploy/request/', { params: formData });
      message.success(`删除 ${res} 条发布记录`);
      setBatchVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (e: any) => {
    setMode(e.target.value);
    setValue(undefined);
    setAppId(undefined);
    setEnvId(undefined);
  };

  if (!batchVisible) return null;

  return (
    <Modal
      open={batchVisible}
      width={400}
      maskClosable={false}
      title="批量删除发布申请"
      onCancel={() => setBatchVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form layout="vertical">
        <Form.Item label="删除方式 :">
          <Radio.Group 
            value={mode} 
            style={{ width: 280 }} 
            onChange={handleModeChange}
          >
            <Radio.Button value="expire">截止时间</Radio.Button>
            <Radio.Button value="count">保留记录</Radio.Button>
            <Radio.Button value="deploy">发布配置</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        {mode === 'expire' && (
          <Form.Item
            label="截止日期 :"
            extra={
              <div>
                将删除截止日期<span style={{ color: 'red' }}>之前</span>的所有发布申请记录。
              </div>
            }
          >
            <DatePicker 
              value={value} 
              style={{ width: 290 }} 
              onChange={setValue} 
              placeholder="请选择截止日期" 
            />
          </Form.Item>
        )}
        
        {mode === 'count' && (
          <Form.Item 
            label="保留记录 :" 
            extra="每个应用每个环境仅保留最新的N条发布申请。"
          >
            <Input 
              value={value} 
              style={{ width: 290 }} 
              onChange={e => setValue(e.target.value)} 
              placeholder="请输入保留个数" 
            />
          </Form.Item>
        )}
        
        {mode === 'deploy' && (
          <Form.Item 
            label="发布配置 :" 
            extra="删除指定应用环境下的发布申请记录。"
          >
            <Space>
              <Select
                showSearch
                style={{ width: 160 }}
                value={appId}
                onChange={setAppId}
                filterOption={(input: string, option: any) => 
                  includes(option?.children || '', input)
                }
                placeholder="请选择应用"
              >
                {appRecords.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
              
              <Select
                showSearch
                style={{ width: 122 }}
                value={envId}
                onChange={setEnvId}
                filterOption={(input: string, option: any) => 
                  includes(option?.children || '', input)
                }
                placeholder="请选择环境"
              >
                {envRecords.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default BatchDelete;
