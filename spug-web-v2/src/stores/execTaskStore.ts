/**
 * 批量执行任务 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';
import useHostStore from '@/stores/hostStore';

interface ExecOutput {
  title: string;
  data: string;
  status: number;
}

interface ExecTaskState {
  // 数据状态
  outputs: Record<string, ExecOutput>;
  tag: string;
  host_ids: number[];
  token: string | null;
  
  // UI状态
  showConsole: boolean;
  showTemplate: boolean;
  
  // 计算属性
  getItems: () => [string, ExecOutput][];
  getCounter: () => Record<string, number>;
  
  // 操作方法
  updateTag: (tag: string) => void;
  switchTemplate: () => void;
  switchConsole: (token?: string) => void;
  
  // 设置方法
  setHostIds: (ids: number[]) => void;
}

const useExecTaskStore = create<ExecTaskState>((set, get) => ({
  // 初始状态
  outputs: {},
  tag: '',
  host_ids: [],
  token: null,
  showConsole: false,
  showTemplate: false,

  // 计算属性
  getItems: () => {
    const { outputs, tag } = get();
    const items = Object.entries(outputs);
    
    if (tag === '') {
      return items;
    } else if (tag === '0') {
      return items.filter(([_, x]) => x.status === -2);
    } else if (tag === '1') {
      return items.filter(([_, x]) => x.status === 0);
    } else {
      return items.filter(([_, x]) => ![-2, 0].includes(x.status));
    }
  },

  getCounter: () => {
    const { outputs } = get();
    const counter = { '0': 0, '1': 0, '2': 0 };
    
    for (let item of Object.values(outputs)) {
      if (item.status === -2) {
        counter['0'] += 1;
      } else if (item.status === 0) {
        counter['1'] += 1;
      } else {
        counter['2'] += 1;
      }
    }
    
    return counter;
  },

  // 操作方法
  updateTag: (tag) => {
    const currentTag = get().tag;
    set({ tag: tag === currentTag ? '' : tag });
  },

  switchTemplate: () => {
    set(state => ({ showTemplate: !state.showTemplate }));
  },

  switchConsole: (token) => {
    const { showConsole, host_ids } = get();
    
    if (showConsole) {
      set({ showConsole: false, outputs: {} });
    } else {
      const hostStore = useHostStore.getState();
      const newOutputs: Record<string, ExecOutput> = {};
      
      for (let id of host_ids) {
        const host = hostStore.idMap[id];
        if (host) {
          newOutputs[host.id] = {
            title: `${host.name}(${host.hostname}:${host.port})`,
            data: '\x1b[36m### WebSocket connecting ...\x1b[0m',
            status: -2
          };
        }
      }
      
      set({ 
        outputs: newOutputs, 
        token: token || null, 
        showConsole: true 
      });
    }
  },

  // 设置方法
  setHostIds: (ids) => set({ host_ids: ids }),
}));

export default useExecTaskStore;
