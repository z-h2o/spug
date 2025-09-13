/**
 * 构建仓库控制台组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { FullscreenOutlined, FullscreenExitOutlined, LoadingOutlined } from '@ant-design/icons';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { Modal, Steps, Spin } from 'antd';
import { getToken } from '@/utils/auth';
import http from '@/libs/http';
import useRepositoryStore from '@/stores/repositoryStore';
import 'xterm/css/xterm.css';
import styles from './index.module.scss';

const Console: React.FC = () => {
  const el = useRef<HTMLDivElement>(null);
  const [term] = useState(new Terminal({ disableStdin: true }));
  const [fullscreen, setFullscreen] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'wait' | 'process' | 'error' | 'finish'>('process');
  const [fetching, setFetching] = useState(true);
  
  const { record, setLogVisible, fetchRecords } = useRepositoryStore();

  useEffect(() => {
    let socket: WebSocket | null = null;
    
    initialTerm();
    
    http.get(`/api/repository/${record.id}/`)
      .then((res: any) => {
        term.write(res.data || res);
        setStep(res.step);
        if (res.status === '1') {
          socket = makeSocket(res.index);
        } else {
          setStatus('wait');
        }
      })
      .finally(() => setFetching(false));
      
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [record.id, term]);

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
        if (data !== undefined) term.write(data);
        if (newStep !== undefined) setStep(newStep);
        if (newStatus !== undefined) setStatus(newStatus);
      }
    };
    
    socket.onerror = () => {
      setStatus('error');
      term.reset();
      term.write('\u001b[31mWebsocket connection failed!\u001b[0m');
    };
    
    return socket;
  };

  useEffect(() => {
    // @ts-ignore
    term.fit && term.fit();
  }, [fullscreen, term]);

  const initialTerm = () => {
    const fitPlugin = new FitAddon();
    term.loadAddon(fitPlugin);
    term.options.fontFamily = 'Source Code Pro, Courier New, Courier, Monaco, monospace, PingFang SC, Microsoft YaHei';
    term.options.theme = { background: '#fafafa', foreground: '#000' };
    
    term.attachCustomKeyEventHandler((arg) => {
      if (arg.ctrlKey && arg.code === 'KeyC' && arg.type === 'keydown') {
        document.execCommand('copy');
        return false;
      }
      return true;
    });
    
    if (el.current) {
      term.open(el.current);
      // @ts-ignore
      term.fit = () => fitPlugin.fit();
      fitPlugin.fit();
    }
  };

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
      width={fullscreen ? '100%' : 1000}
      title={[
        <span key="1">构建控制台</span>,
        <div key="2" className={styles.fullscreen} onClick={() => setFullscreen(!fullscreen)}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </div>
      ]}
      footer={null}
      onCancel={handleClose}
      className={styles.console}
      maskClosable={false}
    >
      <Steps current={step} status={status}>
        <StepItem title="构建准备" step={0} />
        <StepItem title="检出前任务" step={1} />
        <StepItem title="执行检出" step={2} />
        <StepItem title="检出后任务" step={3} />
        <StepItem title="执行打包" step={4} />
      </Steps>
      
      <Spin spinning={fetching}>
        <div className={styles.out}>
          <div ref={el} />
        </div>
      </Spin>
    </Modal>
  );
};

export default Console;
