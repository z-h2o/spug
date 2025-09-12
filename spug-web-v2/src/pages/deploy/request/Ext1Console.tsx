/**
 * 常规发布控制台组件
 */
import React, { useEffect, useState, useRef } from 'react';
import { Card, Progress, Modal, Collapse, Steps, Skeleton, Button } from 'antd';
import { ShrinkOutlined, LoadingOutlined, CloseOutlined, CodeOutlined } from '@ant-design/icons';
import { Terminal } from 'xterm';
import useRequestStore, { type RequestRecord } from '@/stores/requestStore';
import http from '@/libs/http';
import { getToken } from '@/utils/auth';
import OutView from './OutView';
import styles from './index.module.scss';

interface Ext1ConsoleProps {
  request: Partial<RequestRecord>;
}

interface Output {
  id: number;
  title: string;
  status: string;
  step: number;
  data?: string;
}

const Ext1Console: React.FC<Ext1ConsoleProps> = ({ request }) => {
  const { showConsole, fetchInfo } = useRequestStore();
  
  const [mini, setMini] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [outputs, setOutputs] = useState<Record<string, Output>>({});
  const termsRef = useRef<Record<string, Terminal>>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (request.mode === 'read') {
      readDeploy();
    } else {
      doDeploy();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const readDeploy = async () => {
    if (!request.id) return;
    
    try {
      const res: any = await http.get(`/api/deploy/request/${request.id}/`);
      setOutputs(res.outputs || {});
      setTimeout(() => setFetching(false), 100);
      
      if (res.status === '2') {
        makeSocket(res.index);
      }
    } catch (error) {
      console.error('读取发布信息失败:', error);
      setFetching(false);
    }
  };

  const doDeploy = async () => {
    if (!request.id) return;
    
    try {
      const res: any = await http.post(`/api/deploy/request/${request.id}/`, {
        mode: request.mode
      });
      setOutputs(res.outputs || {});
      setTimeout(() => setFetching(false), 100);
      makeSocket();
      fetchInfo(request.id);
    } catch (error) {
      console.error('发布失败:', error);
      setFetching(false);
    }
  };

  const makeSocket = (index = 0) => {
    if (!request.id) return;
    
    const token = request.id;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/request/${token}/?x-token=${getToken()}`
    );
    
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(String(index));
    };

    socket.onmessage = (e) => {
      if (e.data === 'pong') {
        socket.send(String(index));
      } else {
        const data = JSON.parse(e.data);
        if (data.type === 'info') {
          if (request.id) fetchInfo(request.id);
        } else {
          handleSocketMessage(data);
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket连接已关闭');
    };

    socket.onerror = () => {
      setOutputs(prev => {
        const newOutputs = { ...prev };
        for (let key of Object.keys(newOutputs)) {
          newOutputs[key].status = 'error';
          newOutputs[key].data = '\u001b[31mWebsocket connection failed!\u001b[0m';
          if (termsRef.current[key]) {
            termsRef.current[key].reset();
            termsRef.current[key].write('\u001b[31mWebsocket connection failed!\u001b[0m');
          }
        }
        return newOutputs;
      });
    };
  };

  const handleSocketMessage = (data: any) => {
    const { key, data: socketData, step, status } = data;
    
    setOutputs(prev => {
      const newOutputs = { ...prev };
      
      if (!newOutputs[key]) return newOutputs;
      
      if (socketData !== undefined) {
        newOutputs[key].data = (newOutputs[key].data || '') + socketData;
        if (termsRef.current[key]) {
          termsRef.current[key].write(socketData);
        }
      }
      
      if (step !== undefined) {
        newOutputs[key].step = step;
      }
      
      if (status !== undefined) {
        newOutputs[key].status = status;
      }
      
      return newOutputs;
    });
  };

  const handleSetTerm = (term: Terminal, key: string) => {
    if (outputs[key] && outputs[key].data) {
      term.write(outputs[key].data!);
    }
    termsRef.current[key] = term;
  };

  const handleClose = () => {
    setVisible(false);
    if (request.id !== undefined) {
      showConsole(request as RequestRecord, true);
    }
  };

  const handleMini = () => {
    setMini(!mini);
  };

  const switchMiniMode = () => {
    setMini(true);
    setVisible(false);
  };

  const openTerminal = (e: React.MouseEvent, item: Output) => {
    e.stopPropagation();
    window.open(`/ssh?id=${item.id}`);
  };

  const StepItem: React.FC<{ title: string; item: Output; step: number }> = ({ title, item, step, ...props }) => {
    let icon = null;
    if (step === item.step && item.status !== 'error') {
      icon = <LoadingOutlined />;
    }
    return <Steps.Step {...props} title={title} icon={icon} />;
  };

  const { local, ...hosts } = outputs;

  return (
    <div>
      {mini && (
        <Card
          className={styles.item}
          onClick={() => setVisible(true)}
        >
          <div className={styles.header}>
            <div className={styles.title}>{request.name}</div>
            <CloseOutlined onClick={() => handleClose()} />
          </div>
          {local && (
            <Progress
              percent={(local.step + 1) * 18}
              status={local.step === 100 ? 'success' : local.status === 'error' ? 'exception' : 'active'}
            />
          )}
          {Object.values(hosts).map(item => (
            <Progress
              key={item.id}
              percent={(item.step + 1) * 18}
              status={item.step === 100 ? 'success' : item.status === 'error' ? 'exception' : 'active'}
            />
          ))}
        </Card>
      )}
      
      <Modal
        open={visible}
        width="70%"
        footer={null}
        maskClosable={false}
        className={styles.console}
        onCancel={handleClose}
        title={[
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span key="1">{request.name}</span>
            <div key="2" className={styles.miniIcon} onClick={switchMiniMode}>
              <ShrinkOutlined />
            </div>
          </div>
        ]}
      >
        <Skeleton loading={fetching} active>
          {local && (
            <Collapse 
              defaultActiveKey={['0']} 
              className={styles.collapse} 
              style={{ marginBottom: 24 }}
            >
              <Collapse.Panel 
                header={
                  <div className={styles.header}>
                    <b className={styles.title} />
                    <Steps 
                      size="small" 
                      className={styles.step} 
                      current={local.step} 
                      status={local.status as 'wait' | 'process' | 'finish' | 'error'}
                      style={{ margin: 0 }}
                    >
                      <StepItem title="构建准备" item={local} step={0} />
                      <StepItem title="检出前任务" item={local} step={1} />
                      <StepItem title="执行检出" item={local} step={2} />
                      <StepItem title="检出后任务" item={local} step={3} />
                      <StepItem title="执行打包" item={local} step={4} />
                    </Steps>
                  </div>
                }
                key="0"
              >
                <OutView setTerm={(term) => handleSetTerm(term, 'local')} />
              </Collapse.Panel>
            </Collapse>
          )}

          <Collapse defaultActiveKey="0" className={styles.collapse}>
            {Object.entries(hosts).map(([key, item], index) => (
              <Collapse.Panel
                key={index}
                header={
                  <div className={styles.header}>
                    <b className={styles.title}>{item.title}</b>
                    <Steps 
                      size="small" 
                      className={styles.step} 
                      current={item.step} 
                      status={item.status as 'wait' | 'process' | 'finish' | 'error'}
                    >
                      <StepItem title="等待调度" item={item} step={0} />
                      <StepItem title="数据准备" item={item} step={1} />
                      <StepItem title="发布前任务" item={item} step={2} />
                      <StepItem title="执行发布" item={item} step={3} />
                      <StepItem title="发布后任务" item={item} step={4} />
                    </Steps>
                    <CodeOutlined 
                      className={styles.codeIcon} 
                      onClick={(e) => openTerminal(e, item)} 
                    />
                  </div>
                }
              >
                <OutView setTerm={(term) => handleSetTerm(term, key)} />
              </Collapse.Panel>
            ))}
          </Collapse>
        </Skeleton>
      </Modal>
    </div>
  );
};

export default Ext1Console;
