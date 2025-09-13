/**
 * 构建仓库详情组件
 */
import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Table, Button } from 'antd';
import { AuthDiv } from '@/components';
import http from '@/libs/http';
import useRepositoryStore from '@/stores/repositoryStore';

interface DetailProps {
  visible: boolean;
}

interface Request {
  id: number;
  name: string;
  host_ids: number[];
  status_alias: string;
  created_at: string;
}

const Detail: React.FC<DetailProps> = ({ visible }) => {
  const [fetching, setFetching] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { record, setDetailVisible, fetchRecords } = useRepositoryStore();

  useEffect(() => {
    if (record.id && visible) {
      http.get('/api/repository/request/', { 
        params: { repository_id: record.id } 
      })
        .then(res => setRequests(res.data || res))
        .finally(() => setFetching(false));
    }
  }, [visible, record.id]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await http.delete('/api/repository/', { params: { id: record.id } });
      fetchRecords();
      setDetailVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const [extra1, extra2, extra3] = record.extra || [];

  return (
    <Drawer
      width={600}
      open={visible}
      onClose={() => setDetailVisible(false)}
      footer={
        <AuthDiv
          auth="deploy.repository.del"
          style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
        >
          <span style={{ color: '#999', fontSize: 12 }}>
            Tips: 已关联发布申请的构建版本无法删除（删除发布申请时将同步删除该记录）。
          </span>
          <Button 
            danger 
            loading={loading} 
            disabled={requests.length > 0} 
            onClick={handleDelete}
          >
            删除
          </Button>
        </AuthDiv>
      }
    >
      <Descriptions column={1} title={<span style={{ fontSize: 22 }}>基本信息</span>}>
        <Descriptions.Item label="应用">{record.app_name}</Descriptions.Item>
        <Descriptions.Item label="环境">{record.env_name}</Descriptions.Item>
        <Descriptions.Item label="版本">{record.version}</Descriptions.Item>
        {extra1 === 'branch' ? (
          <>
            <Descriptions.Item label="Git分支">{extra2}</Descriptions.Item>
            <Descriptions.Item label="CommitID">{extra3}</Descriptions.Item>
          </>
        ) : (
          <Descriptions.Item label="Git标签">{extra2}</Descriptions.Item>
        )}
        <Descriptions.Item label="内部版本">{record.spug_version}</Descriptions.Item>
        <Descriptions.Item label="构建时间">{record.created_at}</Descriptions.Item>
        <Descriptions.Item label="备注信息">{record.remarks}</Descriptions.Item>
        <Descriptions.Item label="构建人">{record.created_by_user}</Descriptions.Item>
      </Descriptions>
      
      <Descriptions 
        title={<span style={{ fontSize: 22 }}>发布记录</span>} 
        style={{ marginTop: 24 }} 
      />
      
      <Table 
        rowKey="id" 
        loading={fetching} 
        dataSource={requests} 
        pagination={false}
      >
        <Table.Column title="发布申请" dataIndex="name" />
        <Table.Column 
          title="主机数量" 
          dataIndex="host_ids" 
          render={(hostIds: number[]) => `${hostIds?.length || 0}台`} 
        />
        <Table.Column title="状态" dataIndex="status_alias" />
        <Table.Column title="申请时间" dataIndex="created_at" />
      </Table>
    </Drawer>
  );
};

export default Detail;
