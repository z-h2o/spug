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

  useEffect(() => {
    if (!container.current) return;

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
    
    term.open(container.current);
    term.write('WebSocket connecting ... ');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = getToken();
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/ws/ssh/${id}/?x-token=${token}`);
    
    socket.onmessage = e => term.write(e.data);
    socket.onopen = () => {
      term.write('ok');
      term.focus();
      fitTerminal();
    };
    socket.onclose = e => {
      setTimeout(() => term.write('\r\n\r\n\x1b[31mConnection is closed.\x1b[0m\r\n'), 200);
    };
    socket.onerror = e => {
      console.error('WebSocket错误:', e);
      term.write('\r\n\r\n\x1b[31mWebSocket connection error.\x1b[0m\r\n');
    };
    
    term.onData(data => socket.send(JSON.stringify({ data })));
    term.onResize(({ cols, rows }) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({ resize: [cols, rows] }));
      }
    });
    
    window.addEventListener('resize', fitTerminal);

    return () => {
      window.removeEventListener('resize', fitTerminal);
      if (socket) socket.close();
    };
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
      const dims = fitPlugin.proposeDimensions();
      if (!dims || !term || !dims.cols || !dims.rows) return;
      if (term.rows !== dims.rows || term.cols !== dims.cols) {
        // @ts-ignore
        term._core._renderService.clear();
        term.resize(dims.cols, dims.rows);
      }
    }
  }

  return (
    <div className={styles.terminal} ref={container} />
  );
};

export default WebSSHTerminal;
