/**
 * 登录日志表格组件
 */
import React, { useEffect } from 'react';
import { Radio, Tag } from 'antd';
import { TableCard } from '@/components';
import useSystemLoginStore, { LoginRecord } from '@/stores/systemLoginStore';

const SystemLoginTable: React.FC = () => {
  const { 
    isFetching, 
    fetchRecords, 
    getFilteredRecords,
    f_status,
    setFStatus
  } = useSystemLoginStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const dataSource = getFilteredRecords();

  return (
    <TableCard
      tKey="sl"
      rowKey="id"
      title="登录记录"
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
          <Radio.Button value="true">成功</Radio.Button>
          <Radio.Button value="false">失败</Radio.Button>
        </Radio.Group>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      columns={[
        {
          title: '时间',
          width: 200,
          dataIndex: 'created_at'
        },
        {
          title: '账户名',
          width: 120,
          dataIndex: 'username',
        },
        {
          title: '登录方式',
          width: 100,
          dataIndex: 'type',
          render: (text: string) => text === 'ldap' ? 'LDAP' : '普通登录'
        },
        {
          title: '状态',
          width: 90,
          render: (record: LoginRecord) => 
            record.is_success ? 
              <Tag color="success">成功</Tag> : 
              <Tag color="error">失败</Tag>
        },
        {
          title: '登录IP',
          width: 160,
          dataIndex: 'ip',
        },
        {
          title: 'User Agent',
          ellipsis: true,
          dataIndex: 'agent'
        },
        {
          title: '提示信息',
          ellipsis: true,
          dataIndex: 'message'
        }
      ]}
    />
  );
};

export default SystemLoginTable;
