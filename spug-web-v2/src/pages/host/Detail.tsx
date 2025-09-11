/**
 * 主机详情组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Descriptions, List, Button, Input, Select, DatePicker, Tag, message } from 'antd';
import { EditOutlined, SaveOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { AuthButton } from '@/components';
import http from '@/libs/http';
import { cloneDeep } from '@/utils/helper';
import useHostStore from '@/stores/hostStore';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const HostDetail: React.FC = () => {
  const {
    record,
    detailVisible,
    groups,
    setDetailVisible,
    fetchRecords
  } = useHostStore();

  const [edit, setEdit] = useState(false);
  const [host, setHost] = useState<any>(record);
  const diskInput = useRef<any>();
  const sipInput = useRef<any>();
  const gipInput = useRef<any>();
  const [tag, setTag] = useState<string>();
  const [inputVisible, setInputVisible] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (detailVisible) {
      setHost(cloneDeep(record));
    }
  }, [detailVisible, record]);

  useEffect(() => {
    if (inputVisible === 'disk') {
      diskInput.current?.focus();
    } else if (inputVisible === 'sip') {
      sipInput.current?.focus();
    } else if (inputVisible === 'gip') {
      gipInput.current?.focus();
    }
  }, [inputVisible]);

  function handleSubmit() {
    setLoading(true);
    const submitData = { ...host };
    if (submitData.created_time) {
      submitData.created_time = dayjs(submitData.created_time).format('YYYY-MM-DD');
    }
    if (submitData.expired_time) {
      submitData.expired_time = dayjs(submitData.expired_time).format('YYYY-MM-DD');
    }
    
    http.post('/api/host/extend/', { host_id: host.id, ...submitData })
      .then((res: any) => {
        Object.assign(host, res);
        setEdit(false);
        setHost(cloneDeep(host));
        fetchRecords();
      })
      .finally(() => setLoading(false));
  }

  function handleFetch() {
    setFetching(true);
    http.get('/api/host/extend/', { params: { host_id: host.id } })
      .then((res: any) => {
        Object.assign(host, res);
        setHost(cloneDeep(host));
        message.success('同步成功');
      })
      .finally(() => setFetching(false));
  }

  function handleChange(e: any, key: string) {
    const value = e && e.target ? e.target.value : e;
    host[key] = value;
    if (['created_time', 'expired_time'].includes(key) && e) {
      host[key] = dayjs(e).format('YYYY-MM-DD');
    }
    setHost({ ...host });
  }

  function handleClose() {
    setDetailVisible(false);
    setEdit(false);
  }

  function handleTagConfirm(key: string) {
    if (tag) {
      if (key === 'disk') {
        const value = Number(tag);
        if (isNaN(value)) return message.error('请输入数字');
        host.disk ? host.disk.push(value) : host.disk = [value];
      } else if (key === 'sip') {
        host.private_ip_address ? host.private_ip_address.push(tag) : host.private_ip_address = [tag];
      } else if (key === 'gip') {
        host.public_ip_address ? host.public_ip_address.push(tag) : host.public_ip_address = [tag];
      }
      setHost(cloneDeep(host));
    }
    setTag(undefined);
    setInputVisible(null);
  }

  function handleTagRemove(key: string, index: number) {
    if (key === 'disk') {
      host.disk.splice(index, 1);
    } else if (key === 'sip') {
      host.private_ip_address.splice(index, 1);
    } else if (key === 'gip') {
      host.public_ip_address.splice(index, 1);
    }
    setHost(cloneDeep(host));
  }

  return (
    <Drawer
      width={550}
      title={host.name}
      placement="right"
      onClose={handleClose}
      open={detailVisible}
    >
      <Descriptions
        bordered
        size="small"
        labelStyle={{ width: 150 }}
        title={<span style={{ fontWeight: 500 }}>基本信息</span>}
        column={1}
      >
        <Descriptions.Item label="主机名称">{host.name}</Descriptions.Item>
        <Descriptions.Item label="连接地址">{host.username}@{host.hostname}</Descriptions.Item>
        <Descriptions.Item label="连接端口">{host.port}</Descriptions.Item>
        <Descriptions.Item label="独立密钥">{host.pkey ? '是' : '否'}</Descriptions.Item>
        <Descriptions.Item label="描述信息">{host.desc}</Descriptions.Item>
        <Descriptions.Item label="所属分组">
          <List>
            {(host.group_ids || []).map((g_id: number) => (
              <List.Item key={g_id} style={{ padding: '6px 0' }}>
                {groups[g_id]}
              </List.Item>
            ))}
          </List>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        bordered
        size="small"
        column={1}
        className={edit ? styles.hostExtendEdit : undefined}
        labelStyle={{ width: 150 }}
        style={{ marginTop: 24 }}
        extra={edit ? ([
          <Button key="1" type="link" loading={fetching} icon={<SyncOutlined />} onClick={handleFetch}>
            同步
          </Button>,
          <Button key="2" type="link" loading={loading} icon={<SaveOutlined />} onClick={handleSubmit}>
            保存
          </Button>
        ]) : (
          <AuthButton auth="host.host.edit" type="link" icon={<EditOutlined />} onClick={() => setEdit(true)}>
            编辑
          </AuthButton>
        )}
        title={<span style={{ fontWeight: 500 }}>扩展信息</span>}
      >
        <Descriptions.Item label="实例ID">
          {edit ? (
            <Input 
              value={host.instance_id} 
              onChange={e => handleChange(e, 'instance_id')} 
              placeholder="选填" 
            />
          ) : host.instance_id}
        </Descriptions.Item>
        
        <Descriptions.Item label="操作系统">
          {edit ? (
            <Input 
              value={host.os_name} 
              onChange={e => handleChange(e, 'os_name')}
              placeholder="例如：Ubuntu Server 16.04.1 LTS" 
            />
          ) : host.os_name}
        </Descriptions.Item>
        
        <Descriptions.Item label="CPU">
          {edit ? (
            <Input 
              suffix="核" 
              style={{ width: 100 }} 
              value={host.cpu} 
              onChange={e => handleChange(e, 'cpu')}
              placeholder="数字" 
            />
          ) : host.cpu ? `${host.cpu}核` : null}
        </Descriptions.Item>
        
        <Descriptions.Item label="内存">
          {edit ? (
            <Input 
              suffix="GB" 
              style={{ width: 100 }} 
              value={host.memory} 
              onChange={e => handleChange(e, 'memory')}
              placeholder="数字" 
            />
          ) : host.memory ? `${host.memory}GB` : null}
        </Descriptions.Item>
        
        <Descriptions.Item label="磁盘">
          {(host.disk || []).map((item: number, index: number) => (
            <Tag 
              closable={edit} 
              key={index} 
              onClose={() => handleTagRemove('disk', index)}
            >
              {item}GB
            </Tag>
          ))}
          {edit && (inputVisible === 'disk' ? (
            <Input
              ref={diskInput}
              type="text"
              size="small"
              value={tag}
              className={styles.tagNumberInput}
              onChange={e => setTag(e.target.value)}
              onBlur={() => handleTagConfirm('disk')}
              onPressEnter={() => handleTagConfirm('disk')}
            />
          ) : (
            <Tag className={styles.tagAdd} onClick={() => setInputVisible('disk')}>
              <PlusOutlined /> 新建
            </Tag>
          ))}
        </Descriptions.Item>
        
        <Descriptions.Item label="内网IP">
          {(host.private_ip_address || []).map((item: string, index: number) => (
            <Tag 
              closable={edit} 
              key={index} 
              onClose={() => handleTagRemove('sip', index)}
            >
              {item}
            </Tag>
          ))}
          {edit && (inputVisible === 'sip' ? (
            <Input
              ref={sipInput}
              type="text"
              size="small"
              value={tag}
              className={styles.tagInput}
              onChange={e => setTag(e.target.value)}
              onBlur={() => handleTagConfirm('sip')}
              onPressEnter={() => handleTagConfirm('sip')}
            />
          ) : (
            <Tag className={styles.tagAdd} onClick={() => setInputVisible('sip')}>
              <PlusOutlined /> 新建
            </Tag>
          ))}
        </Descriptions.Item>
        
        <Descriptions.Item label="公网IP">
          {(host.public_ip_address || []).map((item: string, index: number) => (
            <Tag 
              closable={edit} 
              key={index} 
              onClose={() => handleTagRemove('gip', index)}
            >
              {item}
            </Tag>
          ))}
          {edit && (inputVisible === 'gip' ? (
            <Input
              ref={gipInput}
              type="text"
              size="small"
              value={tag}
              className={styles.tagInput}
              onChange={e => setTag(e.target.value)}
              onBlur={() => handleTagConfirm('gip')}
              onPressEnter={() => handleTagConfirm('gip')}
            />
          ) : (
            <Tag className={styles.tagAdd} onClick={() => setInputVisible('gip')}>
              <PlusOutlined /> 新建
            </Tag>
          ))}
        </Descriptions.Item>
        
        <Descriptions.Item label="实例计费方式">
          {edit ? (
            <Select
              style={{ width: 150 }}
              value={host.instance_charge_type}
              placeholder="请选择"
              onChange={v => handleChange(v, 'instance_charge_type')}
            >
              <Select.Option value="PrePaid">包年包月</Select.Option>
              <Select.Option value="PostPaid">按量计费</Select.Option>
              <Select.Option value="Other">其他</Select.Option>
            </Select>
          ) : host.instance_charge_type_alias}
        </Descriptions.Item>
        
        <Descriptions.Item label="网络计费方式">
          {edit ? (
            <Select
              style={{ width: 150 }}
              value={host.internet_charge_type}
              placeholder="请选择"
              onChange={v => handleChange(v, 'internet_charge_type')}
            >
              <Select.Option value="PayByBandwidth">按带宽计费</Select.Option>
              <Select.Option value="PayByTraffic">按流量计费</Select.Option>
              <Select.Option value="Other">其他</Select.Option>
            </Select>
          ) : host.internet_charge_type_alias}
        </Descriptions.Item>
        
        <Descriptions.Item label="创建时间">
          {edit ? (
            <DatePicker
              value={host.created_time ? dayjs(host.created_time) : undefined}
              onChange={v => handleChange(v, 'created_time')}
            />
          ) : host.created_time}
        </Descriptions.Item>
        
        <Descriptions.Item label="到期时间">
          {edit ? (
            <DatePicker
              value={host.expired_time ? dayjs(host.expired_time) : undefined}
              onChange={v => handleChange(v, 'expired_time')}
            />
          ) : host.expired_time}
        </Descriptions.Item>
        
        <Descriptions.Item label="更新时间">{host.updated_at}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default HostDetail;
