/**
 * 构建仓库控制台组件
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FullscreenOutlined, FullscreenExitOutlined, LoadingOutlined } from '@ant-design/icons';
import { Terminal } from 'xterm';
import { Modal, Steps, Spin } from 'antd';
import { getToken } from '@/utils/auth';
import http from '@/libs/http';
import useRepositoryStore from '@/stores/repositoryStore';
import OutView from '../request/OutView';
import styles from './index.module.scss';

const Console: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'wait' | 'process' | 'error' | 'finish'>('process');
  const [fetching, setFetching] = useState(true);
  const termsRef = useRef<Terminal | null>(null);
  const { record, setLogVisible, fetchRecords } = useRepositoryStore();

  let socket: WebSocket | null = null;

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const getRecord = useCallback(() => {
    http.get(`/api/repository/${record.id}/`)
      .then((res: any) => {
        termsRef.current?.write(res.data || res);
        setStep(res.step);
        if (res.status === '1') {
          socket = makeSocket(res.index);
        } else {
          setStatus('wait');
        }
      })
      .finally(() => setFetching(false));
  }, [record.id]);


  const makeSocket = (index = 0) => {
    const token = record.spug_version;
    const xToken = getToken();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/build/${token}/?x-token=${xToken}`
    );
    
    socket.onopen = () => socket.send(String(index));
    
    socket.onmessage = e => {
      if (e.data === 'pong') {
        socket.send(String(index));
      } else {
        index += 1;
        const { data, step: newStep, status: newStatus } = JSON.parse(e.data);
        if (data !== undefined) termsRef.current?.write(data);
        if (newStep !== undefined) setStep(newStep);
        if (newStatus !== undefined) setStatus(newStatus);
      }
    };
    
    socket.onerror = () => {
      setStatus('error');
      termsRef.current?.reset();
      termsRef.current?.write('\u001b[31mWebsocket connection failed!\u001b[0m');
    };
    
    return socket;
  };


  const handleSetTerm = useCallback((term: Terminal) => {
    termsRef.current = term;
    getRecord();
  }, [getRecord]);

  const handleClose = () => {
    fetchRecords();
    setLogVisible(false);
  };

  const StepItem: React.FC<{ title: string; step: number }> = ({ title, step: stepNum }) => {
    let icon = null;
    if (stepNum === step && status === 'process') {
      icon = <LoadingOutlined style={{ fontSize: 32 }} />;
    }
    return <Steps.Step title={title} icon={icon} />;
  };

  return (
    <Modal
      open
      width={fullscreen ? '100%' : '70%'}
      title={[
        <span key="1">构建控制台</span>,
        <div key="2" className={styles.fullscreen} onClick={() => setFullscreen(!fullscreen)}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </div>
      ]}
      footer={null}
      onCancel={handleClose}
      className={`${styles.console}`}
      maskClosable={false}
    >
      <Steps current={step} status={status}>
        <StepItem title="构建准备" step={0} />
        <StepItem title="检出前任务" step={1} />
        <StepItem title="执行检出" step={2} />
        <StepItem title="检出后任务" step={3} />
        <StepItem title="执行打包" step={4} />
      </Steps>
      
      <Spin spinning={fetching} wrapperClassName={styles.spinBox}>
        <div className={styles.out}>
          <OutView setTerm={handleSetTerm} />
        </div>
      </Spin>
    </Modal>
  );
};

export default Console;
