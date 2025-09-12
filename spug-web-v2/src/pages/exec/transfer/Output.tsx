/**
 * 文件传输输出组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Space } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import useTransferStore from '@/stores/execTransferStore';
import 'xterm/css/xterm.css';
import styles from '../task/Output.module.scss';

interface OutputProps {
  token: string;
  onBack: () => void;
}

const Output: React.FC<OutputProps> = ({ token, onBack }) => {
  const { outputs, getCounter } = useTransferStore();

  const [activeId, setActiveId] = useState<string>('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal>();
  const fitAddon = useRef<FitAddon>();
  const websocket = useRef<WebSocket>();

  const items = Object.entries(outputs);
  const counter = getCounter();

  useEffect(() => {
    if (items.length > 0 && !activeId) {
      setActiveId(items[0][0]);
    }
  }, [items, activeId]);

  useEffect(() => {
    if (activeId && terminalRef.current) {
      // 初始化终端
      const terminal = new Terminal({
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
        },
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        cursorBlink: true,
        rows: 30,
        cols: 120,
      });

      fitAddon.current = new FitAddon();
      terminal.loadAddon(fitAddon.current);
      terminal.open(terminalRef.current);
      fitAddon.current.fit();

      terminalInstance.current = terminal;

      // 连接WebSocket
      if (token) {
        const wsUrl = `ws://127.0.0.1:9001/api/ws/transfer/${token}/?id=${activeId}`;
        websocket.current = new WebSocket(wsUrl);

        websocket.current.onmessage = (event) => {
          terminal.write(event.data);
        };

        websocket.current.onerror = () => {
          terminal.write('\x1b[31m### WebSocket connection error\x1b[0m\r\n');
        };

        websocket.current.onclose = () => {
          terminal.write('\x1b[33m### WebSocket connection closed\x1b[0m\r\n');
        };
      }

      // 显示已有数据
      const currentItem = items.find(([id]) => id === activeId);
      if (currentItem) {
        terminal.write(currentItem[1].data);
      }

      return () => {
        websocket.current?.close();
        terminal.dispose();
      };
    }
  }, [activeId, token, items]);

  const handleResize = () => {
    fitAddon.current?.fit();
  };

  const getTagColor = (status: number) => {
    switch (status) {
      case -2: return 'orange';  // 传输中
      case 0: return 'green';    // 成功
      default: return 'red';     // 失败
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case -2: return '传输中';
      case 0: return '成功';
      default: return '失败';
    }
  };

  return (
    <div className={styles.output}>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回
          </Button>
          <span>文件传输结果</span>
        </Space>
        
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleResize}>
            调整大小
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.summary}>
            <Space>
              <Tag color="orange">传输中 {counter['0']}</Tag>
              <Tag color="green">成功 {counter['1']}</Tag>
              <Tag color="red">失败 {counter['2']}</Tag>
            </Space>
          </div>
          
          <div className={styles.hostList}>
            {items.map(([id, item]) => (
              <div
                key={id}
                className={`${styles.hostItem} ${activeId === id ? styles.active : ''}`}
                onClick={() => setActiveId(id)}
              >
                <div className={styles.hostTitle}>{item.title}</div>
                <Tag color={getTagColor(item.status)}>
                  {getStatusText(item.status)}
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.terminal}>
          <Card
            size="small"
            title={
              items.find(([id]) => id === activeId)?.[1]?.title || '传输结果'
            }
            bodyStyle={{ padding: 0 }}
          >
            <div ref={terminalRef} className={styles.terminalContainer} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Output;
