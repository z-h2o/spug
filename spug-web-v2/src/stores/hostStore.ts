/**
 * 主机管理 Store
 */
import { create } from 'zustand';
import { message } from 'antd';
import http from '@/libs/http';
import { includes } from '@/utils/common';

interface HostRecord {
  id: number;
  name: string;
  public_ip_address: string[];
  private_ip_address: string[];
  group_ids: number[];
  is_verified: boolean;
  os_type: string;
  os_name: string;
  cpu: number;
  memory: number;
  expired_time?: string;
  desc?: string;
  pkey?: string;
  username?: string;
  hostname?: string;
  port?: string;
  disk?: number[];
  instance_id?: string;
  instance_charge_type?: string;
  instance_charge_type_alias?: string;
  internet_charge_type?: string;
  internet_charge_type_alias?: string;
  created_time?: string;
  updated_at?: string;
}

interface GroupNode {
  key: number;
  title: string;
  parent_id: number;
  children: GroupNode[];
}

interface HostState {
  // 数据状态
  rawTreeData: GroupNode[];
  rawRecords: HostRecord[];
  groups: Record<string, any>;
  group: Partial<GroupNode>;
  record: Partial<HostRecord>;
  idMap: Record<number, HostRecord>;
  
  // UI状态
  addByCopy: boolean;
  grpFetching: boolean;
  isFetching: boolean;
  formVisible: boolean;
  importVisible: boolean;
  syncVisible: boolean;
  cloudImport: string | null;
  detailVisible: boolean;
  selectorVisible: boolean;
  
  // 过滤状态
  f_word?: string;
  f_status: string | boolean;
  
  // 计算属性方法
  getRecords: () => HostRecord[];
  getDataSource: () => HostRecord[];
  getCounter: () => Record<number, Set<number>>;
  getTreeData: () => GroupNode[];
  
  // 操作方法
  fetchRecords: () => Promise<void>;
  fetchExtend: (id: number) => void;
  fetchGroups: () => Promise<void>;
  initial: () => Promise<void>;
  updateGroup: (group: GroupNode, host_ids: number[]) => Promise<void>;
  showForm: (info?: Partial<HostRecord>) => void;
  showSync: () => void;
  showDetail: (info: HostRecord) => void;
  showSelector: (addByCopy: boolean) => void;
  
  // 设置方法
  setGroup: (group: Partial<GroupNode>) => void;
  setRecord: (record: Partial<HostRecord>) => void;
  setFormVisible: (visible: boolean) => void;
  setImportVisible: (visible: boolean) => void;
  setSyncVisible: (visible: boolean) => void;
  setCloudImport: (type: string | null) => void;
  setDetailVisible: (visible: boolean) => void;
  setSelectorVisible: (visible: boolean) => void;
  setFilterWord: (word: string) => void;
  setFilterStatus: (status: string | boolean) => void;
}

const useHostStore = create<HostState>((set, get) => ({
  // 初始状态
  rawTreeData: [],
  rawRecords: [],
  groups: {},
  group: {},
  record: {},
  idMap: {},
  addByCopy: true,
  grpFetching: true,
  isFetching: false,
  formVisible: false,
  importVisible: false,
  syncVisible: false,
  cloudImport: null,
  detailVisible: false,
  selectorVisible: false,
  f_word: '',
  f_status: '',

  // 计算属性方法
  getRecords: () => {
    const { rawRecords, f_word } = get();
    let records = rawRecords;
    if (f_word) {
      records = records.filter(x => {
        if (includes(x.name, f_word)) return true;
        if (x.public_ip_address && includes(x.public_ip_address[0], f_word)) return true;
        return !!(x.private_ip_address && includes(x.private_ip_address[0], f_word));
      });
    }
    return records;
  },

  getDataSource: () => {
    const { group, f_status } = get();
    const records = get().getRecords();
    const counter = get().getCounter();
    
    let result: HostRecord[] = [];
    if (group.key) {
      const host_ids = counter[group.key];
      result = records.filter(x => host_ids && host_ids.has(x.id));
    }
    if (f_status !== '') {
      result = result.filter(x => f_status === x.is_verified);
    }
    return result;
  },

  getCounter: () => {
    const { rawRecords, rawTreeData } = get();
    const counter: Record<number, Set<number>> = {};
    
    for (const host of rawRecords) {
      for (const id of host.group_ids) {
        if (counter[id]) {
          counter[id].add(host.id);
        } else {
          counter[id] = new Set([host.id]);
        }
      }
    }
    
    const handlerCounter = (item: GroupNode, counter: Record<number, Set<number>>) => {
      if (!counter[item.key]) counter[item.key] = new Set();
      for (const child of item.children) {
        handlerCounter(child, counter);
        counter[child.key].forEach(x => counter[item.key].add(x));
      }
    };
    
    for (const item of rawTreeData) {
      handlerCounter(item, counter);
    }
    return counter;
  },

  getTreeData: () => {
    const { rawTreeData, f_word } = get();
    let treeData = JSON.parse(JSON.stringify(rawTreeData));
    if (f_word) {
      const counter = get().getCounter();
      const group = get().group;
      
      const handleFilterGroup = (treeData: GroupNode[]): GroupNode[] => {
        const data = [];
        for (const item of treeData) {
          const host_ids = counter[item.key];
          if (host_ids.size > 0 || item.key === group.key) {
            item.children = handleFilterGroup(item.children);
            data.push(item);
          }
        }
        return data;
      };
      
      treeData = handleFilterGroup(treeData);
    }
    return treeData;
  },

  // 操作方法
  fetchRecords: async () => {
    set({ isFetching: true });
    try {
      const res: any = await http.get('/api/host/');
      const tmp: Record<number, HostRecord> = {};
      res.forEach((item: HostRecord) => tmp[item.id] = item);
      set({ rawRecords: res, idMap: tmp });
    } finally {
      set({ isFetching: false });
    }
  },

  fetchExtend: (id: number) => {
    http.put('/api/host/', { id }).then(() => get().fetchRecords());
  },

  fetchGroups: async () => {
    set({ grpFetching: true });
    try {
      const res: any = await http.get('/api/host/group/');
      set({ groups: res.groups, rawTreeData: res.treeData });
    } finally {
      set({ grpFetching: false });
    }
  },

  initial: async () => {
    const { rawRecords } = get();
    if (rawRecords.length > 0) return Promise.resolve();
    
    set({ isFetching: true, grpFetching: true });
    try {
      const [res1, res2]: any[] = await Promise.all([
        http.get('/api/host/'),
        http.get('/api/host/group/')
      ]);
      
      const idMap: Record<number, HostRecord> = {};
      res1.forEach((item: HostRecord) => idMap[item.id] = item);
      
      const treeData = get().getTreeData();
      set({
        rawRecords: res1,
        idMap,
        groups: res2.groups,
        rawTreeData: res2.treeData,
        group: treeData[0] || {}
      });
    } finally {
      set({ isFetching: false, grpFetching: false });
    }
  },

  updateGroup: async (group: GroupNode, host_ids: number[]) => {
    const { group: currentGroup, addByCopy } = get();
    const form = {
      host_ids,
      s_group_id: group.key,
      t_group_id: currentGroup.key,
      is_copy: addByCopy
    };
    
    await http.patch('/api/host/', form);
    message.success('操作成功');
    get().fetchRecords();
  },

  showForm: (info = {}) => {
    set({ formVisible: true, record: info });
  },

  showSync: () => {
    set(state => ({ syncVisible: !state.syncVisible }));
  },

  showDetail: (info: HostRecord) => {
    set({ record: info, detailVisible: true });
  },

  showSelector: (addByCopy: boolean) => {
    set({ addByCopy, selectorVisible: true });
  },

  // 设置方法
  setGroup: (group: Partial<GroupNode>) => set({ group }),
  setRecord: (record: Partial<HostRecord>) => set({ record }),
  setFormVisible: (visible: boolean) => set({ formVisible: visible }),
  setImportVisible: (visible: boolean) => set({ importVisible: visible }),
  setSyncVisible: (visible: boolean) => set({ syncVisible: visible }),
  setCloudImport: (type: string | null) => set({ cloudImport: type }),
  setDetailVisible: (visible: boolean) => set({ detailVisible: visible }),
  setSelectorVisible: (visible: boolean) => set({ selectorVisible: visible }),
  setFilterWord: (word: string) => set({ f_word: word }),
  setFilterStatus: (status: string | boolean) => set({ f_status: status }),
}));

export default useHostStore;
