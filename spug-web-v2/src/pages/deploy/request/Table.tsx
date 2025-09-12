/**
 * 发布申请表格组件
 */
import React from 'react';
import { 
  BranchesOutlined, 
  BuildOutlined, 
  TagOutlined, 
  PlusOutlined, 
  TagsOutlined 
} from '@ant-design/icons';
import { Radio, Modal, Popover, Tag, Popconfirm, Tooltip, message } from 'antd';
import { Action, TableCard } from '@/components';
import { hasPermission } from '@/utils/auth';
import useRequestStore, { type RequestRecord } from '@/stores/requestStore';
import http from '@/libs/http';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './index.module.scss';

dayjs.extend(relativeTime);

const DeployConfirm: React.FC = () => {
  return (
    <div>
      <div>确认发布方式</div>
      <div style={{ color: '#999', fontSize: 12 }}>补偿：仅发布上次发布失败的主机。</div>
      <div style={{ color: '#999', fontSize: 12 }}>全量：再次发布所有主机。</div>
    </div>
  );
};

const RequestTable: React.FC = () => {
  const {
    isFetching,
    getDataSource,
    fetchRecords,
    counter,
    f_status,
    setStatus,
    setAddVisible,
    showForm,
    showApprove,
    showConsole,
    readConsole,
    rollback
  } = useRequestStore();

  const DoAction: React.FC<{ info: RequestRecord }> = ({ info }) => {
    const { host_ids, fail_host_ids } = info;
    return (
      <Popconfirm
        title={<DeployConfirm />}
        okText="全量"
        cancelText="补偿"
        cancelButtonProps={{ 
          disabled: [0, host_ids.length].includes(fail_host_ids.length) 
        }}
        onConfirm={() => handleDeploy(info, 'all')}
        onCancel={() => handleDeploy(info, 'fail')}
      >
        <Action.Button auth="deploy.request.do">发布</Action.Button>
      </Popconfirm>
    );
  };

  const handleDelete = (info: RequestRecord) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${info.name}】?`,
      onOk: async () => {
        try {
          await http.delete('/api/deploy/request/', { params: { id: info.id } });
          message.success('删除成功');
          fetchRecords();
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    });
  };

  const handleDeploy = (info: RequestRecord, mode: string) => {
    const infoWithMode = { ...info, mode };
    showConsole(infoWithMode);
  };

  const columns = [
    {
      title: '申请标题',
      className: styles.min180,
      render: (info: RequestRecord) => (
        <div>
          {info.type === '2' && (
            <Tooltip title="回滚发布">
              <Tag color="#f50">R</Tag>
            </Tooltip>
          )}
          {info.type === '3' && (
            <Tooltip title="Webhook触发">
              <Tag color="#87d068">A</Tag>
            </Tooltip>
          )}
          {info.plan && (
            <Tooltip title={`定时发布（${info.plan}）`}>
              <Tag color="#108ee9">P</Tag>
            </Tooltip>
          )}
          {info.name}
        </div>
      )
    },
    {
      title: '应用',
      className: styles.min120,
      dataIndex: 'app_name',
    },
    {
      title: '发布环境',
      className: styles.min120,
      dataIndex: 'env_name',
    },
    {
      title: '版本',
      className: styles.min155,
      render: (info: RequestRecord) => {
        if (info.app_extend === '1') {
          const [ext1] = info.extra || info.rep_extra || [];
          switch (ext1) {
            case 'branch':
              return <div><BranchesOutlined /> {info.version}</div>;
            case 'tag':
              return <div><TagOutlined /> {info.version}</div>;
            default:
              return <div><TagsOutlined /> {info.version}</div>;
          }
        } else {
          return <div><BuildOutlined /> {info.version}</div>;
        }
      }
    },
    {
      title: '申请人',
      className: styles.min120,
      dataIndex: 'created_by_user',
      hide: true
    },
    {
      title: '申请时间',
      className: styles.min120,
      dataIndex: 'created_at',
      sorter: (a: RequestRecord, b: RequestRecord) => 
        a.created_at.localeCompare(b.created_at),
      render: (v: string) => (
        <Tooltip title={v}>
          {v ? dayjs(v).fromNow() : null}
        </Tooltip>
      ),
      hide: true
    },
    {
      title: '审核人',
      className: styles.min120,
      dataIndex: 'approve_by_user',
      hide: true
    },
    {
      title: '审核时间',
      className: styles.min120,
      dataIndex: 'approve_at',
      hide: true
    },
    {
      title: '发布人',
      className: styles.min120,
      dataIndex: 'do_by_user',
      hide: true
    },
    {
      title: '发布时间',
      className: styles.min120,
      dataIndex: 'do_at',
    },
    {
      title: '备注',
      className: styles.min120,
      dataIndex: 'desc',
    },
    {
      title: '状态',
      fixed: 'right' as const,
      className: styles.min120,
      render: (info: RequestRecord) => {
        if (info.status === '-1' && info.reason) {
          return (
            <Popover title="驳回原因:" content={info.reason}>
              <Tag color="#f50">{info.status_alias}</Tag>
            </Popover>
          );
        } else if (info.status === '1' && info.reason) {
          return (
            <Popover title="审核意见:" content={info.reason}>
              <Tag color="#87d068">{info.status_alias}</Tag>
            </Popover>
          );
        } else if (info.status === '2') {
          return <Tag color="orange">{info.status_alias}</Tag>;
        } else if (info.status === '3') {
          return <Tag color="green">{info.status_alias}</Tag>;
        } else if (info.status === '-3') {
          return <Tag color="red">{info.status_alias}</Tag>;
        } else {
          return <Tag color="blue">{info.status_alias}</Tag>;
        }
      }
    },
    {
      title: '操作',
      fixed: 'right' as const,
      className: hasPermission('deploy.request.do|deploy.request.edit|deploy.request.approve|deploy.request.del') 
        ? styles.min180 
        : 'none',
      render: (info: RequestRecord) => {
        switch (info.status) {
          case '-3':
            return (
              <Action>
                <Action.Button 
                  auth="deploy.request.do" 
                  onClick={() => readConsole(info)}
                >
                  查看
                </Action.Button>
                <DoAction info={info} />
                {info.visible_rollback && (
                  <Action.Button 
                    auth="deploy.request.do" 
                    onClick={() => rollback(info)}
                  >
                    回滚
                  </Action.Button>
                )}
              </Action>
            );
          case '3':
            return (
              <Action>
                <Action.Button 
                  auth="deploy.request.do" 
                  onClick={() => readConsole(info)}
                >
                  查看
                </Action.Button>
                {info.visible_rollback && (
                  <Action.Button 
                    auth="deploy.request.do" 
                    onClick={() => rollback(info)}
                  >
                    回滚
                  </Action.Button>
                )}
              </Action>
            );
          case '-1':
            return (
              <Action>
                <Action.Button 
                  auth="deploy.request.edit" 
                  onClick={() => showForm(info)}
                >
                  编辑
                </Action.Button>
                <Action.Button 
                  auth="deploy.request.del" 
                  onClick={() => handleDelete(info)}
                >
                  删除
                </Action.Button>
              </Action>
            );
          case '0':
            return (
              <Action>
                <Action.Button 
                  auth="deploy.request.approve" 
                  onClick={() => showApprove(info)}
                >
                  审核
                </Action.Button>
                <Action.Button 
                  auth="deploy.request.edit" 
                  onClick={() => showForm(info)}
                >
                  编辑
                </Action.Button>
                <Action.Button 
                  auth="deploy.request.del" 
                  onClick={() => handleDelete(info)}
                >
                  删除
                </Action.Button>
              </Action>
            );
          case '1':
            return (
              <Action>
                <DoAction info={info} />
                <Action.Button 
                  auth="deploy.request.del" 
                  onClick={() => handleDelete(info)}
                >
                  删除
                </Action.Button>
              </Action>
            );
          case '2':
            return (
              <Action>
                <Action.Button 
                  auth="deploy.request.do" 
                  onClick={() => readConsole(info)}
                >
                  查看
                </Action.Button>
              </Action>
            );
          default:
            return null;
        }
      }
    }
  ];

  return (
    <TableCard
      tKey="dr"
      rowKey={(row: RequestRecord) => row.key || row.id}
      title="申请列表"
      columns={columns}
      scroll={{ x: 1500 }}
      tableLayout="auto"
      loading={isFetching}
      dataSource={getDataSource()}
      onReload={fetchRecords}
      actions={[
        hasPermission('deploy.request.add') && (
          <Action.Button
            key="add"
            auth="deploy.request.add"
            type="primary"
            size='middle'
            icon={<PlusOutlined />}
            onClick={() => setAddVisible(true)}
          >
            新建申请
          </Action.Button>
        ),
        <Radio.Group key="status" value={f_status} onChange={e => setStatus(e.target.value)}>
          <Radio.Button value="all">全部({counter.all || 0})</Radio.Button>
          <Radio.Button value="0">待审核({counter['0'] || 0})</Radio.Button>
          <Radio.Button value="1">待发布({counter['1'] || 0})</Radio.Button>
          <Radio.Button value="3">发布成功({counter['3'] || 0})</Radio.Button>
          <Radio.Button value="-3">发布异常({counter['-3'] || 0})</Radio.Button>
          <Radio.Button value="99">其他({counter['99'] || 0})</Radio.Button>
        </Radio.Group>
      ].filter(Boolean)}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
    />
  );
};

export default RequestTable;
