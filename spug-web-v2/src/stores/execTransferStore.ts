/**
 * 文件传输 Store
 */
import { create } from 'zustand';

interface TransferOutput {
  title: string;
  data: string;
  status: number;
}

interface TransferState {
  // 数据状态
  outputs: Record<string, TransferOutput>;
  
  // 计算属性
  getCounter: () => Record<string, number>;
  
  // 设置方法
  setOutputs: (outputs: Record<string, TransferOutput>) => void;
}

const useTransferStore = create<TransferState>((set, get) => ({
  // 初始状态
  outputs: {},

  // 计算属性
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

  // 设置方法
  setOutputs: (outputs) => set({ outputs }),
}));

export default useTransferStore;
