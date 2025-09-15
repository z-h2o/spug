/**
 * SSH终端组件
 */
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { getToken } from '@/utils/auth';
import 'xterm/css/xterm.css';
import styles from './index.module.scss';

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
  const hasInitializedRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const openedRef = useRef(false);
  const destroyedRef = useRef(false);

  useEffect(() => {
    if (!container.current || hasInitializedRef.current) return;

    console.log('Terminal useEffect 执行 - 初始化终端');
    destroyedRef.current = false;
    openedRef.current = false;
    hasInitializedRef.current = true;
    
    term.loadAddon(fitPlugin);
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
    
    ws.onmessage = e => {
      if (!destroyedRef.current) term.write(e.data);
    };
    ws.onopen = () => {
      openedRef.current = true;
      if (!destroyedRef.current) {
        term.write('ok');
        term.focus();
        fitTerminal();
      } else {
        try { ws.close(); } catch {}
      }
    };
    ws.onclose = e => {
      // 仅在真正建立过连接后再提示关闭，忽略StrictMode初次挂载的早期关闭噪声
      if (!destroyedRef.current && openedRef.current) {
        setTimeout(() => term.write('\r\n\r\n\x1b[31mConnection is closed.\x1b[0m\r\n'), 200);
      }
    };
    ws.onerror = e => {
      console.error('WebSocket错误:', e);
      // 忽略StrictMode导致的早期错误提示，只有建立后再提示
      if (!destroyedRef.current && openedRef.current) {
        term.write('\r\n\r\n\x1b[31mWebSocket connection error.\x1b[0m\r\n');
      }
    };
    
    term.onData(data => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ data }));
      }
    });
    term.onResize(({ cols, rows }) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ resize: [cols, rows] }));
      }
    });
    
    window.addEventListener('resize', fitTerminal);
    return () => {
      console.log('Terminal useEffect 清理');
      destroyedRef.current = true;
      window.removeEventListener('resize', fitTerminal);
      try {
        if (socketRef.current) {
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.close();
          } else if (socketRef.current.readyState === WebSocket.CONNECTING) {
            // 等到真正open后由onopen里检测destroyedRef再关闭，避免报错日志
            socketRef.current.onopen = () => socketRef.current && socketRef.current.close();
          }
        }
      } catch {}
      socketRef.current = null;
      openedRef.current = false;
      // 不在开发StrictMode清理周期销毁term，避免二次初始化时_renderService缺失
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
      // 延迟执行，等待容器完成布局
      requestAnimationFrame(() => {
        const dims = fitPlugin.proposeDimensions();
        if (!dims || !term || !dims.cols || !dims.rows) return;
        if (term.rows !== dims.rows || term.cols !== dims.cols) {
          try {
            term.resize(dims.cols, dims.rows);
          } catch {}
        }
      });
    }
  }

  return (
    <div className={styles.terminal} ref={container} />
  );
};

export default WebSSHTerminal;
