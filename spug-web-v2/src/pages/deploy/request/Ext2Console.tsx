/**
 * 自定义发布控制台组件
 */
import React, { useEffect, useState, useRef } from 'react';
import { Card, Progress, Modal, Collapse, Steps, Skeleton } from 'antd';
import { ShrinkOutlined, LoadingOutlined, CloseOutlined, CodeOutlined } from '@ant-design/icons';
import { Terminal } from 'xterm';
import useRequestStore, { type RequestRecord } from '@/stores/requestStore';
import http from '@/libs/http';
import { getToken } from '@/utils/auth';
import OutView from './OutView';
import styles from './index.module.scss';

interface Ext2ConsoleProps {
  request: Partial<RequestRecord>;
}

interface Output {
  id: string;
  title?: string;
  status: string;
  step: number;
  data?: string;
}

const Ext2Console: React.FC<Ext2ConsoleProps> = ({ request }) => {
  const { showConsole, fetchInfo } = useRequestStore();
  
  const termsRef = useRef<Record<string, Terminal>>({});
  const outputsRef = useRef<Record<string, Output>>({ local: { id: 'local', status: 'wait', step: 0 } });
  const [sActions, setSActions] = useState<any[]>([]);
  const [hActions, setHActions] = useState<any[]>([]);
  const [mini, setMini] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [, forceUpdate] = useState({});
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

  const readDeploy = () => {
    if (!request.id) return;
    
    let socket: WebSocket | null = null;
    http.get(`/api/deploy/request/${request.id}/`)
      .then((res: any) => {
        setSActions(res.s_actions || []);
        setHActions(res.h_actions || []);
        Object.assign(outputsRef.current, res.outputs || {});
        setTimeout(() => setFetching(false), 100);
        if (res.status === '2') {
          socket = makeSocket(res.index);
        }
      });
    
    return () => socket && socket.close();
  };

  const doDeploy = () => {
    if (!request.id) return;
    
    let socket: WebSocket | null = null;
    http.post(`/api/deploy/request/${request.id}/`, { mode: request.mode })
      .then((res: any) => {
        setSActions(res.s_actions || []);
        setHActions(res.h_actions || []);
        Object.assign(outputsRef.current, res.outputs || {});
        setTimeout(() => setFetching(false), 100);
        socket = makeSocket();
        if (request.id) {
          fetchInfo(request.id);
        }
      });
    
    return () => socket && socket.close();
  };

  const makeSocket = (index = 0) => {
    if (!request.id) return null;
    
    const token = request.id;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/request/${token}/?x-token=${getToken()}`
    );
    
    socketRef.current = socket;

    socket.onopen = () => socket.send(String(index));
    
    socket.onmessage = (e) => {
      if (e.data === 'pong') {
        socket.send(String(index));
      } else {
        const { key, data, step, status } = JSON.parse(e.data);
        if (!outputsRef.current[key]) return;
        
        if (data !== undefined) {
          outputsRef.current[key].data = (outputsRef.current[key].data || '') + data;
          if (termsRef.current[key]) {
            termsRef.current[key].write(data);
          }
        }
        if (step !== undefined) outputsRef.current[key].step = step;
        if (status !== undefined) outputsRef.current[key].status = status;
        
        // 强制更新组件
        forceUpdate({});
      }
    };

    socket.onerror = () => {
      for (let key of Object.keys(outputsRef.current)) {
        outputsRef.current[key].status = 'error';
        outputsRef.current[key].data = '\u001b[31mWebsocket connection failed!\u001b[0m';
        if (termsRef.current[key]) {
          termsRef.current[key].reset();
          termsRef.current[key].write('\u001b[31mWebsocket connection failed!\u001b[0m');
        }
      }
    };
    
    return socket;
  };

  const StepItem: React.FC<{ title: string; item: Output; step: number }> = ({ title, item, step, ...props }) => {
    let icon = null;
    if (step === item.step && item.status !== 'error') {
      if (item.id === 'local' || outputsRef.current.local.step === 100) {
        icon = <LoadingOutlined />;
      }
    }
    return <Steps.Step {...props} title={title} icon={icon} />;
  };

  const switchMiniMode = () => {
    setMini(true);
    setVisible(false);
  };

  const handleSetTerm = (term: Terminal, key: string) => {
    if (outputsRef.current[key] && outputsRef.current[key].data) {
      term.write(outputsRef.current[key].data!);
    }
    termsRef.current[key] = term;
  };

  const openTerminal = (e: React.MouseEvent, item: Output) => {
    e.stopPropagation();
    window.open(`/ssh?id=${item.id}`);
  };

  const handleClose = () => {
    setVisible(false);
    if (request.id !== undefined) {
      showConsole(request as RequestRecord, true);
    }
  };

  const hostOutputs = Object.values(outputsRef.current).filter(x => x.id !== 'local');

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
          <Progress 
            percent={Math.round((outputsRef.current.local.step + 1) * (90 / (1 + sActions.length)))}
            status={outputsRef.current.local.step === 100 ? 'success' : 
                   outputsRef.current.local.status === 'error' ? 'exception' : 'active'}
          />
          {hostOutputs.map(item => (
            <Progress
              key={item.id}
              percent={Math.round(item.step * (90 / hActions.length))}
              status={item.step === 100 ? 'success' : item.status === 'error' ? 'exception' : 'active'}
            />
          ))}
        </Card>
      )}
      
      <Modal
        open={visible}
        width={1000}
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
          {sActions.length > 0 && (
            <Collapse defaultActiveKey={['0']} className={styles.collapse}>
              <Collapse.Panel 
                header={
                  <div className={styles.header}>
                    <b className={styles.title} />
                    <Steps 
                      size="small" 
                      className={styles.step} 
                      current={outputsRef.current.local.step}
                      status={outputsRef.current.local.status as 'wait' | 'process' | 'finish' | 'error'}
                    >
                      <StepItem title="建立连接" item={outputsRef.current.local} step={0} />
                      {sActions.map((item, index) => (
                        <StepItem key={index} title={item.title} item={outputsRef.current.local} step={index + 1} />
                      ))}
                    </Steps>
                  </div>
                }
                key="0"
              >
                <OutView setTerm={(term) => handleSetTerm(term, 'local')} />
              </Collapse.Panel>
            </Collapse>
          )}

          {hostOutputs.length > 0 && (
            <Collapse
              accordion
              defaultActiveKey="0"
              className={styles.collapse}
              style={{ marginTop: sActions.length > 0 ? 24 : 0 }}
            >
              {hostOutputs.map((item, index) => (
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
                        {hActions.map((action, index) => (
                          <StepItem key={index} title={action.title} item={item} step={index + 1} />
                        ))}
                      </Steps>
                      <CodeOutlined 
                        className={styles.codeIcon} 
                        onClick={(e) => openTerminal(e, item)} 
                      />
                    </div>
                  }
                >
                  <OutView setTerm={(term) => handleSetTerm(term, item.id)} />
                </Collapse.Panel>
              ))}
            </Collapse>
          )}
        </Skeleton>
      </Modal>
    </div>
  );
};

export default Ext2Console;
