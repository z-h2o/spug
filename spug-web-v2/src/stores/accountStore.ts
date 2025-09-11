/**
 * 系统账户管理 Store
 */
import { create } from 'zustand';
import http from '@/libs/http';

interface AccountRecord {
  id: number;
  username: string;
  nickname: string;
  role_ids: number[];
  is_active: boolean;
  last_login?: string;
  type?: string;
  is_supper?: boolean;
  wx_token?: string;
}

interface AccountState {
  // 数据状态
  records: AccountRecord[];
  record: Partial<AccountRecord>;
  
  // UI状态
  isFetching: boolean;
  formVisible: boolean;
  
  // 过滤状态
  f_name?: string;
  f_status: string;
  
  // 计算属性方法
  getDataSource: () => AccountRecord[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  showForm: (info?: AccountRecord) => void;
  
  // 设置方法
  setFormVisible: (visible: boolean) => void;
  setFilterName: (name?: string) => void;
  setFilterStatus: (status: string) => void;
}

const useAccountStore = create<AccountState>((set, get) => ({
  // 初始状态
  records: [],
  record: {},
  isFetching: true,
  formVisible: false,
  f_name: undefined,
  f_status: '',

  // 计算属性方法
  getDataSource: () => {
    const { records, f_name, f_status } = get();
    let filteredRecords = records;
    
    if (f_name) {
      filteredRecords = filteredRecords.filter(x => 
        x.username.toLowerCase().includes(f_name.toLowerCase())
      );
    }
    
    if (f_status) {
      filteredRecords = filteredRecords.filter(x => 
        String(x.is_active) === f_status
      );
    }
    
    return filteredRecords;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/account/user/');
      set({ records: res });
    } finally {
      set({ isFetching: false });
    }
  },

  showForm: (info?: Partial<AccountRecord>) => {
    set({ formVisible: true, record: info || {} });
  },

  // 设置方法
  setFormVisible: (visible) => set({ formVisible: visible }),
  setFilterName: (name) => set({ f_name: name }),
  setFilterStatus: (status) => set({ f_status: status }),
}));

export default useAccountStore;
