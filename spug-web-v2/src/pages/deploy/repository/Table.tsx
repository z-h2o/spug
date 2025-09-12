/**
 * 构建仓库表格组件
 */
import React, { useState } from 'react';
import { Table, Modal, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, TableCard } from '@/components';
import { hasPermission } from '@/utils/auth';
import useRepositoryStore from '@/stores/repositoryStore';
import http from '@/libs/http';

const RepositoryTable: React.FC = () => {
  const {
    isFetching,
    getDataSource,
    fetchRecords,
    showForm,
    showDetail,
    showConsole
  } = useRepositoryStore();

  const [loading, setLoading] = useState<number | null>(null);

  const handleRebuild = (info: any) => {
    if (info.status === '5') {
      Modal.confirm({
        title: '重新构建提示',
        content: `当前选择版本 ${info.version} 已完成构建，再次构建将覆盖已有的数据，要再次重新构建吗？`,
        onOk: () => rebuild(info)
      });
    } else if (info.status === '1') {
      return message.error('已在构建中，请点击日志查看详情');
    } else {
      rebuild(info);
    }
  };

  const rebuild = (info: any) => {
    setLoading(info.id);
    http.patch('/api/repository/', { id: info.id, action: 'rebuild' })
      .then(() => showConsole(info))
      .finally(() => setLoading(null));
  };

  const expandedRowRender = (record: any) => {
    return (
      <Table rowKey="id" dataSource={record.child} pagination={false}>
        <Table.Column 
          title="版本" 
          render={(info: any) => (
            <div 
              style={{ color: '#1890ff', cursor: 'pointer' }} 
              onClick={() => showDetail(info)}
            >
              {info.version}
            </div>
          )}
        />
        <Table.Column title="环境" dataIndex="env_name" />
        <Table.Column title="构建时间" dataIndex="created_at" />
        <Table.Column title="备注" dataIndex="remarks" />
        <Table.Column 
          title="状态" 
          render={(info: any) => (
            <Tag color={statusColorMap[info.status]}>{info.status_alias}</Tag>
          )}
        />
        {hasPermission('deploy.repository.detail|deploy.repository.build|deploy.repository.log') && (
          <Table.Column 
            width={180} 
            title="操作" 
            render={(info: any) => (
              <Action>
                <Action.Button
                  auth="deploy.repository.build"
                  loading={loading === info.id}
                  disabled={info.remarks === 'SPUG AUTO MAKE'}
                  onClick={() => handleRebuild(info)}
                >
                  构建
                </Action.Button>
                <Action.Button 
                  auth="deploy.repository.build" 
                  onClick={() => showConsole(info)}
                >
                  日志
                </Action.Button>
              </Action>
            )}
          />
        )}
      </Table>
    );
  };

  const statusColorMap: Record<string, string> = { '0': 'cyan', '1': 'blue', '2': 'red', '5': 'green' };

  return (
    <TableCard
      tKey="dre"
      rowKey="id"
      title="构建版本列表"
      loading={isFetching}
      dataSource={getDataSource()}
      onReload={fetchRecords}
      actions={[
        hasPermission('deploy.repository.add') && (
          <Action.Button
            key="add"
            auth="deploy.repository.add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={showForm}
          >
            新建
          </Action.Button>
        )
      ].filter(Boolean)}
      expandable={{ 
        expandedRowRender, 
        expandRowByClick: true 
      }}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    >
      <Table.Column title="应用" dataIndex="app_name" />
      <Table.Column 
        title="最新版本" 
        render={(info: any) => `${info.version}（${info.env_name}）`}
      />
      <Table.Column title="构建时间" dataIndex="created_at" />
      <Table.Column title="构建人" dataIndex="created_by_user" />
      <Table.Column 
        width={100} 
        title="状态"
        render={(info: any) => (
          <Tag color={statusColorMap[info.status]}>{info.status_alias}</Tag>
        )}
      />
    </TableCard>
  );
};

export default RepositoryTable;
