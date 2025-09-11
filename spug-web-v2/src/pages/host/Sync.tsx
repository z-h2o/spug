/**
 * 批量同步组件
 */
import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { X_TOKEN } from '@/utils/auth';
import styles from './index.module.scss';

interface SyncProps {
  token: string;
  hosts: Record<string, any>;
  style?: React.CSSProperties;
}

interface HostStatus {
  name: string;
  status?: 'ok' | 'fail';
  message?: string;
}

const Sync: React.FC<SyncProps> = ({ token, hosts: initialHosts, style }) => {
  const [hosts, setHosts] = useState<Record<string, HostStatus>>(initialHosts);

  useEffect(() => {
    let index = 0;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/host/${token}/?x-token=${X_TOKEN}`
    );

    socket.onopen = () => socket.send(String(index));
    
    socket.onmessage = e => {
      if (e.data === 'pong') {
        socket.send(String(index));
      } else {
        index += 1;
        const { key, status, message } = JSON.parse(e.data);
        const updatedHosts = { ...hosts };
        updatedHosts[key].status = status;
        updatedHosts[key].message = message;
        setHosts(updatedHosts);
      }
    };

    return () => socket && socket.close();
  }, [token, hosts]);

  return (
    <Form 
      labelCol={{ span: 8 }} 
      wrapperCol={{ span: 14 }} 
      className={styles.batchSync} 
      style={style}
    >
      {Object.entries(hosts).map(([key, item]) => (
        <Form.Item key={key} label={item.name} extra={item.message}>
          {item.status === 'ok' && <span style={{ color: "#52c41a" }}>成功</span>}
          {item.status === 'fail' && <span style={{ color: "red" }}>失败</span>}
          {item.status === undefined && <LoadingOutlined />}
        </Form.Item>
      ))}
    </Form>
  );
};

export default Sync;
