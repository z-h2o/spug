/**
 * 终端输出视图组件
 */
import React, { useEffect, useRef } from 'react';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface OutViewProps {
  setTerm: (term: Terminal) => void;
}

const OutView: React.FC<OutViewProps> = ({ setTerm }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!elementRef.current) return;

      const fitPlugin = new FitAddon();
      const term = new Terminal({ 
        disableStdin: true,
        fontFamily: 'Source Code Pro, Courier New, Courier, Monaco, monospace, PingFang SC, Microsoft YaHei',
        theme: { 
          background: '#fff', 
          foreground: '#000',
          selectionBackground: '#999'
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
      setTerm(term);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [setTerm]);

  return (
    <div style={{ padding: '8px 0 0 15px' }}>
      <div ref={elementRef} style={{ height: 300 }} />
    </div>
  );
};

export default OutView;
