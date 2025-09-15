/**
 * SSH终端组件
 */
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { getToken } from '@/utils/auth';
import 'xterm/css/xterm.css';
import styles from './index.module.scss';

// 扩展 Terminal 类型以访问内部 API（xterm 5.0）
declare module 'xterm' {
  interface Terminal {
    _core?: {
      _renderService?: {
        clear(): void;
      };
    };
  }
}

interface TerminalProps {
  id: number;
  vId: string;
  activeId?: string;
}

interface TerminalSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  styles: any;
}

// 默认终端设置
const defaultTerminalSettings: TerminalSettings = {
  fontSize: 14,
  fontFamily: 'Courier',
  theme: 'dark',
  styles: {
    background: '#2b2b2b',
    foreground: '#A9B7C6',
    cursor: '#A9B7C6',
    selection: '#214283',
    black: '#000000',
    red: '#FF6B68',
    green: '#A8C023',
    yellow: '#D6BF55',
    blue: '#5394EC',
    magenta: '#AE8ABE',
    cyan: '#299999',
    white: '#FFFFFF',
    brightBlack: '#555555',
    brightRed: '#FF8785',
    brightGreen: '#A8C023',
    brightYellow: '#FFFF00',
    brightBlue: '#7EAEF1',
    brightMagenta: '#FF99CC',
    brightCyan: '#6CDADA',
    brightWhite: '#FFFFFF'
  }
};

const WebSSHTerminal: React.FC<TerminalProps> = ({ id, vId, activeId }) => {
  console.log(`Terminal组件渲染 - id:${id}, vId:${vId}, activeId:${activeId}`);
  
  const container = useRef<HTMLDivElement>(null);
  const [term] = useState(new Terminal());
  const [fitPlugin] = useState(new FitAddon());
  const [terminalSettings] = useState(defaultTerminalSettings);
  const socketRef = useRef<WebSocket | null>(null);
  const initializedRef = useRef(false);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!container.current || initializedRef.current) return;
    initializedRef.current = true;
    
    term.loadAddon(fitPlugin);
    // 使用 xterm 5.0 的 options API
    term.options.fontSize = terminalSettings.fontSize;
    term.options.fontFamily = terminalSettings.fontFamily;
    term.options.theme = terminalSettings.styles;
    
    term.attachCustomKeyEventHandler((arg) => {
      if (arg.code === 'PageUp' && arg.type === 'keydown') {
        term.scrollPages(-1);
        return false;
      } else if (arg.code === 'PageDown' && arg.type === 'keydown') {
        term.scrollPages(1);
        return false;
      }
      return true;
    });
    
    // 避免重复DOM，确保容器干净
    if (container.current) {
      container.current.innerHTML = '';
    }
    term.open(container.current);
    // 尽量让首次fit在open后异步执行，避免不可用尺寸
    // 在onopen和window resize中再次适配
    term.write('WebSocket connecting ... ');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = getToken();
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/ssh/${id}/?x-token=${token}`);
    socketRef.current = ws;
    
    ws.onmessage = e => term.write(e.data);
    ws.onopen = () => {
      connectedRef.current = true; // 标记连接成功
      term.write('ok');
      term.focus();
      fitTerminal();
    };
    ws.onclose = e => {
      // 只有在真正建立过连接后才显示关闭消息
      if (connectedRef.current) {
        setTimeout(() => term.write('\r\n\r\n\x1b[31mConnection is closed.\x1b[0m\r\n'), 200);
      }
      connectedRef.current = false;
    };
    
    term.onData(data => ws.send(JSON.stringify({ data })));
    term.onResize(({ cols, rows }) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ resize: [cols, rows] }));
      }
    });
    
    window.addEventListener('resize', fitTerminal);
    return () => {
      window.removeEventListener('resize', fitTerminal);
      if (ws) {
        connectedRef.current = false; // 防止显示关闭消息
        ws.close();
      }
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    term.options.fontSize = terminalSettings.fontSize;
    term.options.fontFamily = terminalSettings.fontFamily;
    term.options.theme = terminalSettings.styles;
  }, [terminalSettings]);

  useEffect(() => {
    if (vId === activeId) {
      setTimeout(() => term.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useLayoutEffect(fitTerminal);

  function fitTerminal() {
    if (vId === activeId) {
      try {
        // xterm 5.0 中使用 FitAddon 的 fit() 方法
        fitPlugin.fit();
      } catch (error) {
        // 如果 fit() 失败，回退到手动计算尺寸
        const dims = fitPlugin.proposeDimensions();
        if (dims && dims.cols && dims.rows) {
          if (term.rows !== dims.rows || term.cols !== dims.cols) {
            // 尝试清理渲染服务（如果存在）
            try {
              if (term._core && term._core._renderService) {
                term._core._renderService.clear();
              }
            } catch {}
            term.resize(dims.cols, dims.rows);
          }
        }
      }
    }
  }

  return (
    <div className={styles.terminal} ref={container} />
  );
};

export default WebSSHTerminal;
