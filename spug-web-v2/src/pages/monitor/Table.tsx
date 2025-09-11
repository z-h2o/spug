/**
 * 监控表格组件
 */
import React, { useEffect } from 'react';
import { Table, Modal, Radio, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, AuthButton, TableCard } from '@/components';
import { hasPermission } from '@/utils/auth';
import http from '@/libs/http';
import useMonitorStore from '@/stores/monitorStore';

const MonitorTable: React.FC = () => {
  const {
    isFetching,
    f_active,
    getDataSource,
    fetchRecords,
    showForm,
    setFilterActive
  } = useMonitorStore();

  const dataSource = getDataSource();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleActive = (record: any) => {
    Modal.confirm({
      title: '操作确认',
      content: `确定要${record.is_active ? '禁用' : '启用'}【${record.name}】?`,
      onOk: () => {
        return http.patch('/api/monitor/', { 
          id: record.id, 
          is_active: !record.is_active 
        }).then(() => {
          message.success('操作成功');
          fetchRecords();
        });
      },
    });
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => {
        return http.delete('/api/monitor/', { params: { id: record.id } })
          .then(() => {
            message.success('删除成功');
            fetchRecords();
          });
      },
    });
  };

  const columns = [
    {
      title: '监控分组',
      dataIndex: 'group',
      key: 'group',
    },
    {
      title: '监控名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type_alias',
      key: 'type_alias',
    },
    {
      title: '频率',
      dataIndex: 'rate',
      key: 'rate',
      render: (value: number) => `${value}分钟`,
    },
    {
      title: '状态',
      key: 'status',
      render: (record: any) => {
        if (record.is_active) {
          return <Tag color="blue">已激活</Tag>;
        } else {
          return <Tag color="red">未激活</Tag>;
        }
      },
    },
    {
      title: '更新于',
      dataIndex: 'latest_run_time_alias',
      key: 'latest_run_time_alias',
      sorter: (a: any, b: any) => (a.latest_run_time || '').localeCompare(b.latest_run_time || ''),
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
  ];

  // 如果有编辑/删除权限，添加操作列
  if (hasPermission('monitor.monitor.edit|monitor.monitor.del')) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 180,
      render: (record: any) => (
        <Action>
          <Action.Button 
            auth="monitor.monitor.edit" 
            onClick={() => handleActive(record)}
          >
            {record.is_active ? '禁用' : '启用'}
          </Action.Button>
          <Action.Button 
            auth="monitor.monitor.edit" 
            onClick={() => showForm(record)}
          >
            编辑
          </Action.Button>
          <Action.Button 
            danger 
            auth="monitor.monitor.del" 
            onClick={() => handleDelete(record)}
          >
            删除
          </Action.Button>
        </Action>
      ),
    } as any);
  }

  return (
    <TableCard
      rowKey="id"
      title="监控任务"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="monitor.monitor.add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showForm()}
        >
          新建
        </AuthButton>,
        <Radio.Group
          key="filter"
          value={f_active}
          onChange={e => setFilterActive(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="1">已激活</Radio.Button>
          <Radio.Button value="0">未激活</Radio.Button>
        </Radio.Group>,
      ]}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
    />
  );
};

export default MonitorTable;
