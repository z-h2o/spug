/**
 * 监控卡片组件
 */
import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Space, Tooltip, Spin, message } from 'antd';
import { FrownOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import useMonitorStore from '@/stores/monitorStore';
import styles from './index.module.scss';

// 状态样式映射
const StyleMap = {
  '0': { background: '#99999933', border: '1px solid #999', color: '#999999' },
  '1': { background: '#16a98733', border: '1px solid #16a987', color: '#16a987' },
  '2': { background: '#ffba0033', border: '1px solid #ffba00', color: '#ffba00' },
  '3': { background: '#f2655d33', border: '1px solid #f2655d', color: '#f2655d' },
  '10': { background: '#99999919', border: '1px dashed #999999', color: '#999999' }
};

// 状态文本映射
const StatusMap = {
  '1': '正常',
  '2': '警告',
  '3': '紧急',
  '0': '未激活',
  '10': '待调度'
};

interface CardItemProps {
  data: {
    status: string;
    type: string;
    group: string;
    desc?: string;
    name: string;
    target: string;
    latest_run_time?: string;
  };
}

const CardItem: React.FC<CardItemProps> = ({ data }) => {
  const { status, type, group, desc, name, target, latest_run_time } = data;
  
  const title = (
    <div>
      <div>分组: {group}</div>
      <div>类型: {type}</div>
      <div>名称: {name}</div>
      <div>目标: {target}</div>
      <div>状态: {StatusMap[status as keyof typeof StatusMap]}</div>
      <div>更新: {latest_run_time || '---'}</div>
      <div>描述: {desc || '---'}</div>
    </div>
  );
  
  return (
    <Tooltip title={title}>
      <div 
        className={styles.card} 
        style={StyleMap[status as keyof typeof StyleMap] || StyleMap['0']} 
      />
    </Tooltip>
  );
};

const MonitorCard: React.FC = () => {
  const {
    groups,
    types,
    ovFetching,
    autoReload,
    f_group,
    f_type,
    f_name,
    getOvDataSource,
    fetchOverviews,
    setAutoReload,
    setFilterGroup,
    setFilterType,
    setFilterName
  } = useMonitorStore();

  const [localAutoReload, setLocalAutoReload] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const ovDataSource = getOvDataSource();

  useEffect(() => {
    fetchOverviews();
    
    return () => setAutoReload(null);
  }, [fetchOverviews, setAutoReload]);

  const handleAutoReload = () => {
    const newAutoReload = !localAutoReload;
    setAutoReload(newAutoReload);
    message.info(newAutoReload ? '开启自动刷新' : '关闭自动刷新');
    if (newAutoReload) {
      fetchOverviews();
    }
    setLocalAutoReload(newAutoReload);
  };

  const filteredRecords = ovDataSource.filter(x => !statusFilter || x.status === statusFilter);

  return (
    <Card 
      title="总览" 
      style={{ marginBottom: 24 }} 
      styles={{ body: { padding: '12px 24px' }}}
      extra={
        <Space size="middle">
          <Space>
            <div>分组：</div>
            <Select 
              allowClear 
              style={{ minWidth: 150 }} 
              value={f_group} 
              onChange={setFilterGroup}
              placeholder="请选择"
            >
              {groups.map(item => (
                <Select.Option value={item} key={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Space>
            <div>类型：</div>
            <Select 
              allowClear 
              style={{ width: 120 }} 
              value={f_type} 
              onChange={setFilterType}
              placeholder="请选择"
            >
              {types.map(item => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Space>
            <div>名称：</div>
            <Input 
              allowClear 
              value={f_name} 
              onChange={e => setFilterName(e.target.value)} 
              placeholder="请输入" 
            />
          </Space>
        </Space>
      }
    >
      <Spin spinning={ovFetching}>
        <div className={styles.header}>
          {Object.entries(StyleMap).map(([s, style]) => {
            const count = ovDataSource.filter(x => x.status === s).length;
            return count ? (
              <Tooltip key={s} title={StatusMap[s as keyof typeof StatusMap]}>
                <div
                  className={styles.item}
                  style={s === statusFilter ? style : { ...style, background: '#fff' }}
                  onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                >
                  {count}
                </div>
              </Tooltip>
            ) : null;
          })}
          <Tooltip title="自动刷新">
            <div className={styles.autoLoad} onClick={handleAutoReload}>
              {localAutoReload ? 
                <SyncOutlined spin style={{ color: '#2563fc' }} /> : 
                <ReloadOutlined />
              }
            </div>
          </Tooltip>
        </div>
        
        {filteredRecords.length > 0 ? (
          <Space wrap size={4}>
            {filteredRecords.map(item => (
              <CardItem key={item.id} data={item} />
            ))}
          </Space>
        ) : (
          <div className={styles.notMatch}>
            <FrownOutlined />
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default MonitorCard;
