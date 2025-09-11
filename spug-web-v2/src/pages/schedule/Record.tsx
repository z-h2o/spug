/**
 * 任务执行记录组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag } from 'antd';
import { LinkButton } from '@/components';
import http from '@/libs/http';
import useScheduleStore from '@/stores/scheduleStore';

interface RecordItem {
  id: string;
  run_time: string;
  status: number;
  status_alias: string;
}

const ScheduleRecord: React.FC = () => {
  const { record, recordVisible, setRecordVisible, showInfo } = useScheduleStore();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<RecordItem[]>([]);

  const colors = ['orange', 'green', 'red'];

  useEffect(() => {
    if (recordVisible && record.id) {
      setLoading(true);
      http.get(`/api/schedule/${record.id}/`)
        .then((res: any) => setRecords(res))
        .finally(() => setLoading(false));
    }
  }, [recordVisible, record.id]);

  const columns = [
    {
      title: '执行时间',
      dataIndex: 'run_time',
      key: 'run_time',
    },
    {
      title: '执行状态',
      key: 'status',
      render: (info: RecordItem) => (
        <Tag color={colors[info.status]}>{info.status_alias}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (info: RecordItem) => (
        <LinkButton onClick={() => showInfo(undefined, info.id)}>
          详情
        </LinkButton>
      ),
    },
  ];

  return (
    <Modal
      open={recordVisible}
      width={800}
      maskClosable={false}
      title={`任务执行记录 - ${record.name || ''}`}
      onCancel={() => setRecordVisible(false)}
      footer={null}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showLessItems: true,
          hideOnSinglePage: true,
          showTotal: total => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </Modal>
  );
};

export default ScheduleRecord;
