/**
 * 报警历史表格组件
 */
import React, { useEffect, useState } from 'react';
import { Radio, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { TableCard } from '@/components';
import useAlarmStore, { AlarmRecord } from '@/stores/alarmStore';
import useAlarmGroupStore from '@/stores/alarmGroupStore';

const AlarmTable: React.FC = () => {
  const { 
    isFetching, 
    fetchRecords, 
    f_status,
    setFStatus,
    getFilteredRecords
  } = useAlarmStore();
  
  const { 
    fetchRecords: fetchGroups,
    getGroupMap
  } = useAlarmGroupStore();

  const [groupMap, setGroupMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchRecords();
    fetchGroups().then(() => {
      setGroupMap(getGroupMap());
    });
  }, [fetchRecords, fetchGroups, getGroupMap]);

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '监控类型',
      dataIndex: 'type',
    },
    {
      title: '监控对象',
      dataIndex: 'target'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value: string) => 
        value === '1' ? 
          <Tag color="orange">报警发生</Tag> : 
          <Tag color="green">故障恢复</Tag>
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
    },
    {
      title: '通知方式',
      dataIndex: 'notify_mode',
    },
    {
      title: '通知对象',
      dataIndex: 'notify_grp',
      render: (value: number[]) => value.map(id => groupMap[id]).join(',')
    },
    {
      title: '发生时间',
      dataIndex: 'created_at'
    }
  ];

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="aa"
      rowKey="id"
      title={(
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>报警历史记录</div>
          <Tooltip title="每天自动清理，仅保留最近30天的报警记录。">
            <QuestionCircleOutlined style={{ color: '#999', marginLeft: 8 }} />
          </Tooltip>
        </div>
      )}
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <Radio.Group 
          key="status-filter"
          value={f_status} 
          onChange={e => setFStatus(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="1">报警发生</Radio.Button>
          <Radio.Button value="2">报警恢复</Radio.Button>
        </Radio.Group>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      columns={columns}
    />
  );
};

export default AlarmTable;
