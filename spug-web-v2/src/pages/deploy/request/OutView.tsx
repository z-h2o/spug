/**
 * 终端输出视图组件
 */
import React, { useEffect, useRef } from 'react';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface OutViewProps {
  setTerm: (term: Terminal) => void;
  theme?: any;
}

const OutView: React.FC<OutViewProps> = ({ setTerm, theme }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // 防止重复初始化
    if (initializedRef.current || !elementRef.current) return;
    
    const timer = setTimeout(() => {
      if (!elementRef.current || initializedRef.current) return;
      
      initializedRef.current = true;

      const fitPlugin = new FitAddon();
      const term = new Terminal({ 
        disableStdin: true,
        fontFamily: 'Source Code Pro, Courier New, Courier, Monaco, monospace, PingFang SC, Microsoft YaHei',
        theme: { 
          background: '#fff', 
          foreground: '#000',
          selectionBackground: '#999',
          ...theme
        }
      });
      
      term.loadAddon(fitPlugin);
      
      term.attachCustomKeyEventHandler((arg) => {
        if (arg.ctrlKey && arg.code === 'KeyC' && arg.type === 'keydown') {
          document.execCommand('copy');
          return false;
        }
        return true;
      });
      
      term.open(elementRef.current);
      fitPlugin.fit();
      
      termRef.current = term;
      setTerm(term);
    }, 100);

    return () => {
      clearTimeout(timer);
      // 组件卸载时清理
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [setTerm, theme]);

  return (
    <div style={{ padding: '8px 0 0 15px' }}>
      <div ref={elementRef} style={{ height: 300 }} />
    </div>
  );
};

export default OutView;
