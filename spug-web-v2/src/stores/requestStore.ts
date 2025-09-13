/**
 * 发布申请状态管理
 */
import { create } from 'zustand';
import { Dayjs } from 'dayjs';
import http from '@/libs/http';

export interface RequestRecord {
  id: number;
  name: string;
  app_id: number;
  app_name: string;
  env_id: number;
  env_name: string;
  app_extend: string;
  deploy_id: number;
  type: string;
  version: string;
  extra?: any[];
  rep_extra?: any[];
  status: string;
  status_alias: string;
  host_ids: number[];
  app_host_ids?: number[];
  fail_host_ids: number[];
  created_at: string;
  created_by_user: string;
  approve_at?: string;
  approve_by_user?: string;
  do_at?: string;
  do_by_user?: string;
  desc?: string;
  reason?: string;
  plan?: string | Dayjs;
  visible_rollback?: boolean;
  require_upload?: boolean;
  mode?: string;
  key?: number;
  rb_id?: number;
  repository_id?: number;
}

export interface RequestCounter {
  all: number;
  '-3': number;
  '0': number;
  '1': number;
  '3': number;
  '99': number;
}

interface RequestState {
  // 数据状态
  records: RequestRecord[];
  record: Partial<RequestRecord>;
  counter: RequestCounter;
  tabs: Array<Partial<RequestRecord>>;
  
  // UI状态
  isFetching: boolean;
  addVisible: boolean;
  ext1Visible: boolean;
  ext2Visible: boolean;
  batchVisible: boolean;
  approveVisible: boolean;
  rollbackVisible: boolean;
  
  // 筛选状态
  f_status: string;
  f_app_id?: number;
  f_env_id?: number;
  f_s_date?: string;
  f_e_date?: string;
  
  // 计算属性
  getDataSource: () => RequestRecord[];
  
  // 异步方法
  fetchRecords: () => Promise<void>;
  fetchInfo: (id: number) => Promise<void>;
  
  // UI方法
  confirmAdd: (deploy: any) => void;
  rollback: (info: RequestRecord) => void;
  showForm: (info: RequestRecord) => void;
  showApprove: (info: RequestRecord) => void;
  showConsole: (info: RequestRecord, isClose?: boolean) => void;
  readConsole: (info: RequestRecord) => void;
  leaveConsole: () => void;
  updateDate: (dates: any) => void;
  
  // 内部方法
  updateCounter: () => void;
  
  // 设置方法
  setAddVisible: (visible: boolean) => void;
  setExt1Visible: (visible: boolean) => void;
  setExt2Visible: (visible: boolean) => void;
  setBatchVisible: (visible: boolean) => void;
  setApproveVisible: (visible: boolean) => void;
  setRollbackVisible: (visible: boolean) => void;
  setStatus: (status: string) => void;
  setAppId: (f_app_id?: number) => void;
  setEnvId: (f_env_id?: number) => void;
  setRecord: (record: Partial<RequestRecord>) => void;
}

const useRequestStore = create<RequestState>((set, get) => ({
  // 数据状态
  records: [],
  record: {},
  counter: {
    all: 0,
    '-3': 0,
    '0': 0,
    '1': 0,
    '3': 0,
    '99': 0,
  },
  tabs: [],
  
  // UI状态
  isFetching: false,
  addVisible: false,
  ext1Visible: false,
  ext2Visible: false,
  batchVisible: false,
  approveVisible: false,
  rollbackVisible: false,
  
  // 筛选状态
  f_status: 'all',
  f_app_id: undefined,
  f_env_id: undefined,
  f_s_date: undefined,
  f_e_date: undefined,
  
  // 计算属性
  getDataSource: () => {
    const { records, f_app_id, f_env_id, f_s_date, f_e_date, f_status } = get();
    let data = records;
    
    if (f_app_id) {
      data = data.filter(x => x.app_id === f_app_id);
    }
    if (f_env_id) {
      data = data.filter(x => x.env_id === f_env_id);
    }
    if (f_s_date) {
      data = data.filter(x => {
        const date = x.created_at.substr(0, 10);
        return date >= f_s_date && date <= (f_e_date || f_s_date);
      });
    }
    if (f_status !== 'all') {
      if (f_status === '99') {
        data = data.filter(x => ['-1', '2'].includes(x.status));
      } else {
        data = data.filter(x => x.status === f_status);
      }
    }
    
    return data;
  },
  
  // 异步方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: RequestRecord[] = await http.get('/api/deploy/request/');
      set({ records: res });
      get().updateCounter();
    } catch (error) {
      console.error('Failed to fetch request records:', error);
    } finally {
      set({ isFetching: false });
    }
  },
  
  fetchInfo: async (id: number) => {
    try {
      const res: Partial<RequestRecord> = await http.get('/api/deploy/request/info/', { params: { id } });
      const { records } = get();
      const updatedRecords = records.map(item => 
        item.id === id ? { ...item, ...res, key: Date.now() } : item
      );
      set({ records: updatedRecords });
      get().updateCounter();
    } catch (error) {
      console.error('Failed to fetch request info:', error);
    }
  },
  
  // 内部方法
  updateCounter: () => {
    const { records } = get();
    const counter: RequestCounter = { all: 0, '-3': 0, '0': 0, '1': 0, '3': 0, '99': 0 };
    
    records.forEach(item => {
      counter.all += 1;
      if (['-1', '2'].includes(item.status)) {
        counter['99'] += 1;
      } else {
        counter[item.status as keyof RequestCounter] += 1;
      }
    });
    
    set({ counter });
  },
  
  // UI方法
  confirmAdd: (deploy: any) => {
    const { id, host_ids, require_upload } = deploy;
    const record = { 
      deploy_id: id, 
      app_host_ids: host_ids, 
      require_upload 
    };
    
    set({ 
      record, 
      addVisible: false 
    });
    
    if (deploy.extend === '1') {
      set({ ext1Visible: true });
    } else {
      set({ ext2Visible: true });
    }
  },
  
  rollback: (info: RequestRecord) => {
    const record = {
      deploy_id: info.deploy_id,
      host_ids: info.host_ids,
      app_host_ids: info.host_ids,
      name: `${info.name} - 回滚`
    };
    set({ 
      record, 
      rollbackVisible: true 
    });
  },
  
  showForm: (info: RequestRecord) => {
    const record = { ...info };
    // 处理日期字段
    if (info.plan && typeof info.plan === 'string') {
      // 这里需要moment，但我们使用dayjs
      // record.plan = dayjs(info.plan);
    }
    
    set({ record });
    
    if (info.app_extend === '1') {
      set({ ext1Visible: true });
    } else {
      set({ ext2Visible: true });
    }
  },
  
  showApprove: (info: RequestRecord) => {
    set({ 
      record: info, 
      approveVisible: true 
    });
  },
  
  showConsole: (info: RequestRecord, isClose = false) => {
    const { tabs } = get();
    const index = tabs.findIndex(x => x.id === info.id);
    
    if (isClose) {
      if (index !== -1) {
        const newTabs = [...tabs];
        newTabs[index] = {};
        set({ tabs: newTabs });
      }
      get().fetchInfo(info.id);
    } else if (index === -1) {
      set({ tabs: [...tabs, info] });
    }
  },
  
  readConsole: (info: RequestRecord) => {
    const { tabs } = get();
    const index = tabs.findIndex(x => x.id === info.id);
    
    if (index === -1) {
      const newInfo = { ...info, mode: 'read' };
      set({ tabs: [...tabs, newInfo] });
    }
  },
  
  leaveConsole: () => {
    set({ tabs: [] });
  },
  
  updateDate: (dates: any) => {
    if (dates && dates.length === 2) {
      set({
        f_s_date: dates[0].format('YYYY-MM-DD'),
        f_e_date: dates[1].format('YYYY-MM-DD')
      });
    } else {
      set({
        f_s_date: undefined,
        f_e_date: undefined
      });
    }
  },
  
  // 设置方法
  setAddVisible: (visible: boolean) => {
    set({ addVisible: visible });
  },
  
  setExt1Visible: (visible: boolean) => {
    set({ ext1Visible: visible });
  },
  
  setExt2Visible: (visible: boolean) => {
    set({ ext2Visible: visible });
  },
  
  setBatchVisible: (visible: boolean) => {
    set({ batchVisible: visible });
  },
  
  setApproveVisible: (visible: boolean) => {
    set({ approveVisible: visible });
  },
  
  setRollbackVisible: (visible: boolean) => {
    set({ rollbackVisible: visible });
  },
  
  setStatus: (status: string) => {
    set({ f_status: status });
  },
  
  setAppId: (f_app_id?: number) => {
    set({ f_app_id });
  },
  
  setEnvId: (f_env_id?: number) => {
    set({ f_env_id });
  },
  
  setRecord: (record: Partial<RequestRecord>) => {
    set({ record });
  },
}));

export default useRequestStore;
