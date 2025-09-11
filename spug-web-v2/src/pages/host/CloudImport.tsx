/**
 * 云平台导入组件
 */
import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Steps, Cascader, Radio, message } from 'antd';
import http from '@/libs/http';
import useHostStore from '@/stores/hostStore';
import styles from './index.module.scss';

const CloudImport: React.FC = () => {
  const {
    cloudImport,
    getTreeData,
    setCloudImport,
    fetchRecords
  } = useHostStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [ak, setAK] = useState<string>('');
  const [ac, setAC] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [groupId, setGroupId] = useState<number[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [username, setUsername] = useState('root');
  const [port, setPort] = useState('22');
  const [hostType, setHostType] = useState('private');

  const treeData = getTreeData();

  function handleSubmit() {
    setLoading(true);
    const formData = {
      ak,
      ac,
      type: cloudImport,
      region_id: regionId,
      group_id: groupId[groupId.length - 1],
      username,
      port,
      host_type: hostType
    };
    
    http.post('/api/host/import/cloud/', formData, { timeout: 120000 })
      .then((res: any) => {
        message.success(`已同步/导入 ${res} 台主机`);
        setCloudImport(null);
        fetchRecords();
      }, () => setLoading(false));
  }

  function fetchRegions() {
    setLoading(true);
    http.get('/api/host/import/region/', { 
      params: { ak, ac, type: cloudImport } 
    })
      .then((res: any) => {
        setRegions(res);
        setStep(1);
      })
      .finally(() => setLoading(false));
  }

  const helpUrl = cloudImport === 'ali' 
    ? 'https://help.aliyun.com/document_detail/175967.html' 
    : 'https://console.cloud.tencent.com/capi';

  return (
    <Modal
      open={!!cloudImport}
      maskClosable={false}
      title="批量导入"
      footer={null}
      onCancel={() => setCloudImport(null)}
    >
      <Steps current={step} className={styles.steps}>
        <Steps.Step key={0} title="访问凭据" />
        <Steps.Step key={1} title="导入确认" />
      </Steps>
      
      <Form labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
        <Form.Item hidden={step === 1} required label="AccessKey ID">
          <Input value={ak} onChange={e => setAK(e.target.value)} placeholder="请输入" />
        </Form.Item>
        
        <Form.Item 
          hidden={step === 1} 
          required 
          label="AccessKey Secret" 
          extra={(
            <a href={helpUrl} target="_blank" rel="noopener noreferrer">
              如何获取AccessKey ？
            </a>
          )}
        >
          <Input value={ac} onChange={e => setAC(e.target.value)} placeholder="请输入" />
        </Form.Item>
        
        <Form.Item 
          hidden={step === 0} 
          required 
          label="选择区域" 
          tooltip="选择导入指定区域的主机。"
        >
          <Select placeholder="请选择" value={regionId} onChange={setRegionId}>
            {regions.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item 
          hidden={step === 0} 
          required 
          label="选择分组" 
          tooltip="将主机导入指定分组。"
        >
          <Cascader
            value={groupId}
            onChange={setGroupId}
            options={treeData}
            fieldNames={{ label: 'title', value: 'key', children: 'children' }}
            placeholder="请选择"
          />
        </Form.Item>
        
        <Form.Item 
          hidden={step === 0} 
          label="基础信息" 
          tooltip="以下信息用于进行SSH验证，导入完成后通过点击批量验证按钮进行批量验证并同步主机扩展信息。" 
        />
        
        <Form.Item 
          hidden={step === 0} 
          labelCol={{ span: 10 }} 
          wrapperCol={{ span: 12 }} 
          label="用户名"
        >
          <Input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="默认SSH登录的账户名" 
          />
        </Form.Item>
        
        <Form.Item 
          hidden={step === 0} 
          labelCol={{ span: 10 }} 
          wrapperCol={{ span: 12 }} 
          label="端口号"
        >
          <Input 
            value={port} 
            onChange={e => setPort(e.target.value)} 
            placeholder="默认SSH端口号" 
          />
        </Form.Item>
        
        <Form.Item 
          hidden={step === 0} 
          labelCol={{ span: 10 }} 
          wrapperCol={{ span: 12 }} 
          label="连接地址"
          extra="将根据选择进行自动匹配获取。"
        >
          <Radio.Group value={hostType} onChange={e => setHostType(e.target.value)}>
            <Radio value="public">公网地址</Radio>
            <Radio value="private">私网地址</Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item wrapperCol={{ span: 14, offset: 8 }}>
          {step === 0 ? (
            <Button 
              type="primary" 
              loading={loading} 
              disabled={!ak || !ac} 
              onClick={fetchRegions}
            >
              下一步
            </Button>
          ) : ([
            <Button
              key="1"
              type="primary"
              loading={loading}
              disabled={!regionId || !groupId.length}
              onClick={handleSubmit}
            >
              同步导入
            </Button>,
            <Button 
              key="2" 
              style={{ marginLeft: 24 }} 
              onClick={() => setStep(0)}
            >
              上一步
            </Button>
          ])}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CloudImport;
