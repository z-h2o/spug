/**
 * 批量验证组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, List, Spin, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import { X_TOKEN } from '@/utils/auth';
import useHostStore from '@/stores/hostStore';

interface SyncResult {
  id: number;
  name: string;
  status?: 'ok' | 'fail' | 'pending';
  message?: string;
}

const BatchSync: React.FC = () => {
  const {
    syncVisible,
    rawRecords,
    setSyncVisible,
    fetchRecords
  } = useHostStore();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (syncVisible) {
      const hostList = rawRecords.filter(host => !host.is_verified)
        .map(host => ({
          id: host.id,
          name: host.name,
          status: 'pending' as const
        }));
      setResults(hostList);
    }
  }, [syncVisible, rawRecords]);

  function handleStart() {
    setLoading(true);
    const hostIds = results.map(item => item.id);
    
    // 启动批量验证
    http.post('/api/host/batch/verify/', { host_ids: hostIds })
      .then((res: any) => {
        const token = res.token;
        startWebSocket(token);
      })
      .catch(() => {
        setLoading(false);
        message.error('启动批量验证失败');
      });
  }

  function startWebSocket(token: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/host/verify/${token}/?x-token=${X_TOKEN}`
    );

    socket.onopen = () => {
      console.log('WebSocket连接已建立');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { host_id, status, message: msg, progress: currentProgress } = data;
      
      setResults(prev => prev.map(item => 
        item.id === host_id 
          ? { ...item, status, message: msg }
          : item
      ));
      
      if (currentProgress !== undefined) {
        setProgress(currentProgress);
      }
    };

    socket.onclose = () => {
      setLoading(false);
      fetchRecords(); // 刷新主机列表
    };

    socket.onerror = () => {
      setLoading(false);
      message.error('WebSocket连接错误');
    };
  }

  function handleClose() {
    setSyncVisible(false);
    setResults([]);
    setProgress(0);
    setLoading(false);
  }

  const successCount = results.filter(item => item.status === 'ok').length;
  const failCount = results.filter(item => item.status === 'fail').length;
  const totalCount = results.length;

  return (
    <Modal
      open={syncVisible}
      title="批量验证主机"
      width={600}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          关闭
        </Button>,
        <Button 
          key="start" 
          type="primary" 
          loading={loading}
          disabled={totalCount === 0}
          onClick={handleStart}
        >
          开始验证
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          验证进度: {successCount + failCount} / {totalCount}
        </div>
        <Progress 
          percent={Math.round((successCount + failCount) / totalCount * 100)} 
          status={loading ? 'active' : 'normal'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#52c41a' }}>成功: {successCount}</span>
          <span style={{ color: '#ff4d4f' }}>失败: {failCount}</span>
        </div>
      </div>

      <List
        size="small"
        dataSource={results}
        style={{ maxHeight: 400, overflow: 'auto' }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                item.status === 'ok' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : item.status === 'fail' ? (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                ) : (
                  <LoadingOutlined style={{ color: '#1890ff' }} />
                )
              }
              title={item.name}
              description={item.message || '等待验证...'}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default BatchSync;
