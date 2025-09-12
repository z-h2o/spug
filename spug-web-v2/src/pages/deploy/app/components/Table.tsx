/**
 * 应用管理表格组件
 */
import React from 'react';
import { Table, Modal, Tag, Divider, message } from 'antd';
import { 
  BuildOutlined, 
  DownSquareOutlined, 
  ExclamationCircleOutlined, 
  OrderedListOutlined, 
  UpSquareOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import { TableCard, AuthButton, Action } from '@/components';
import { hasPermission } from '@/utils/auth';
import http from '@/libs/http';
import useDeployAppStore, { type AppRecord, type DeployRecord } from '@/stores/deployAppStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import CloneConfirm from './CloneConfirm';
import { cloneDeep } from 'lodash';

const AppTable: React.FC = () => {
  const { 
    records,
    f_name,
    f_desc,
    getDataSource,
    isFetching, 
    fetchRecords, 
    loadDeploys, 
    showForm, 
    showExtForm, 
    showAutoDeploy 
  } = useDeployAppStore();

  const { idMap: envIdMap } = useConfigEnvStore();

  // 使用响应式计算 dataSource
  const dataSource = React.useMemo(() => {
    return getDataSource();
  }, [records, f_name, f_desc, getDataSource]);

  const handleClone = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    let deploy: DeployRecord | null = null;
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: '选择克隆对象',
      content: <CloneConfirm onChange={(selectedDeploy) => deploy = cloneDeep(selectedDeploy)} />,
      onOk: () => {
        if (!deploy) {
          message.error('请选择要克隆的应用及环境');
          return Promise.reject();
        }
        (deploy as any).env_id = undefined;
        showExtForm(id, deploy, true, false);
      },
    });
  };

  const handleDelete = (e: React.MouseEvent, record: AppRecord) => {
    e.stopPropagation();
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除应用【${record.name}】?`,
      onOk: async () => {
        try {
          await http.delete('/api/app/', { params: { id: record.id } });
          message.success('删除成功');
          fetchRecords();
        } catch (error) {
          console.error('Delete failed:', error);
        }
      },
    });
  };

  const handleDeployDelete = (record: DeployRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `删除发布配置将会影响基于该配置所创建发布申请的发布和回滚功能，确定要删除发布配置?`,
      onOk: async () => {
        try {
          await http.delete('/api/app/deploy/', { params: { id: record.id } });
          message.success('删除成功');
          loadDeploys(record.app_id);
        } catch (error) {
          console.error('Delete deploy failed:', error);
        }
      },
    });
  };

  const handleSort = async (e: React.MouseEvent, info: AppRecord, sort: string) => {
    e.stopPropagation();
    try {
      await http.patch('/api/app/', { id: info.id, sort });
      fetchRecords();
    } catch (error) {
      console.error('Sort failed:', error);
    }
  };

  const handleExpand = (expanded: boolean, record: AppRecord) => {
    if (expanded && !record.isLoaded) {
      loadDeploys(record.id);
    }
  };

  const expandedRowRender = (record: AppRecord) => {
    return (
      <Table
        rowKey="id"
        loading={record.deploys === undefined}
        dataSource={record.deploys}
        pagination={false}
      >
        <Table.Column 
          width={80} 
          title="模式" 
          dataIndex="extend" 
          render={(value: string) => value === '1' ? 
            <OrderedListOutlined style={{ fontSize: 20, color: '#1890ff' }} /> :
            <BuildOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          } 
        />
        <Table.Column 
          title="发布环境" 
          dataIndex="env_id" 
          render={(value: number) => envIdMap[value]?.name || `环境${value}`} 
        />
        <Table.Column 
          title="关联主机" 
          dataIndex="host_ids" 
          render={(value: number[]) => `${value?.length || 0} 台`} 
        />
        <Table.Column 
          title="发布审核" 
          dataIndex="is_audit"
          render={(value: boolean) => value ? 
            <Tag color="green">开启</Tag> : 
            <Tag color="red">关闭</Tag>
          } 
        />
        {hasPermission('deploy.app.config|deploy.app.edit') && (
          <Table.Column 
            title="操作" 
            render={(info: DeployRecord) => (
              <Action>
                <Action.Button
                  auth="deploy.app.config"
                  onClick={() => showAutoDeploy(info)}
                >
                  Webhook
                </Action.Button>
                {hasPermission('deploy.app.edit') ? (
                  <Action.Button onClick={() => showExtForm(record.id, info)}>
                    编辑
                  </Action.Button>
                ) : hasPermission('deploy.app.config') ? (
                  <Action.Button onClick={() => showExtForm(record.id, info, false, true)}>
                    查看
                  </Action.Button>
                ) : null}
                <Action.Button 
                  danger 
                  auth="deploy.app.edit" 
                  onClick={() => handleDeployDelete(info)}
                >
                  删除
                </Action.Button>
              </Action>
            )} 
          />
        )}
      </Table>
    );
  };
  return (
    <TableCard
      title="应用列表"
      rowKey="id"
      loading={isFetching}
      dataSource={dataSource}
      expandable={{ 
        expandedRowRender, 
        expandRowByClick: true, 
        onExpand: handleExpand 
      }}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="deploy.app.add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showForm()}
        >
          新建
        </AuthButton>
      ]}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    >
      <Table.Column 
        width={80} 
        title="排序" 
        key="series" 
        render={(info: AppRecord) => (
          <div>
            <UpSquareOutlined
              onClick={(e) => handleSort(e, info, 'up')}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
            <Divider type="vertical" />
            <DownSquareOutlined
              onClick={(e) => handleSort(e, info, 'down')}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </div>
        )} 
      />
      <Table.Column title="应用名称" dataIndex="name" />
      <Table.Column title="标识符" dataIndex="key" />
      <Table.Column ellipsis title="描述信息" dataIndex="desc" />
      {hasPermission('deploy.app.edit|deploy.app.del') && (
        <Table.Column 
          width={260} 
          title="操作" 
          render={(info: AppRecord) => (
            <Action>
              <Action.Button 
                auth="deploy.app.edit" 
                onClick={(e) => {
                  e?.stopPropagation();
                  showExtForm(info.id);
                }}
              >
                新建发布
              </Action.Button>
              <Action.Button 
                auth="deploy.app.edit" 
                onClick={(e) => handleClone(e, info.id)}
              >
                克隆发布
              </Action.Button>
              <Action.Button 
                auth="deploy.app.edit" 
                onClick={(e) => {
                  e?.stopPropagation();
                  showForm(info);
                }}
              >
                编辑
              </Action.Button>
              <Action.Button 
                danger 
                auth="deploy.app.del" 
                onClick={(e) => handleDelete(e, info)}
              >
                删除
              </Action.Button>
            </Action>
          )} 
        />
      )}
    </TableCard>
  );
};

export default AppTable;
